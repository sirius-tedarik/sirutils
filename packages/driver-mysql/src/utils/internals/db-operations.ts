import { type BlobType, ProjectError, unwrap, wrapAsync } from '@sirutils/core'
import type { TAnySchema } from '@sirutils/schema'
import { Seql } from '@sirutils/seql'

import { mysqlTags } from '../../tag'

// TODO: indexes and deletions

export const createDBOperations = <T extends TAnySchema, S>(
  api: Sirutils.Mysql.DBApi<S>,
  _options: Sirutils.Mysql.DBOptions<T, S>,
  additionalCause: Sirutils.ErrorValues
): Sirutils.Mysql.DBApi<S>['operations'] => {
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  const defineColumn = (field: Sirutils.SchemaPlugin.Field) => {
    const isRequired =
      (typeof field.required === 'undefined' || field.required === true) && !field.default
        ? 'NOT NULL'
        : ''

    let type = 'varchar(255)'
    let defaultValue = ''

    if (field.type === 'ulid') {
      type = 'VARCHAR(26)'
    } else if (field.type === 'uuid') {
      type = 'CHAR(36)'
    } else if (field.type === 'string') {
      type = `varchar(${field.maxLength})`
    } else if (field.type === 'number' || field.type === 'incremental') {
      type = 'INT'
    } else if (field.type === 'boolean') {
      type = `ENUM('true', 'false')`
    } else if (field.type === 'array' || field.type === 'object') {
      type = 'JSON'
    } else if (field.type === 'relation') {
      return null
    }

    if (field.default && field.type === 'number') {
      defaultValue = `DEFAULT  ${Number.parseInt(field.default as string)}`
    } else if (field.default && (field.type === 'array' || field.type === 'object')) {
      // TODO: Alter later
      defaultValue = ''
    } else if (field.default) {
      defaultValue = `DEFAULT '${field.default}'`
    }

    if (field.type === 'incremental') {
      defaultValue += ' AUTO_INCREMENT'
    }

    if (field.name === 'id') {
      defaultValue += ' PRIMARY KEY'
    }

    return `${field.name} ${type} ${isRequired} ${defaultValue}`.trim()
  }

  return {
    createTable: wrapAsync(
      original => {
        const query = Seql.query`CREATE TABLE ${Seql.table(original.name)} (
          ${Seql.raw(
            original.fields
              .map(field => defineColumn(field))
              .filter(x => !!x)
              .join(',')
          )}
        );`

        return api.exec(query, {
          safe: true,
        })
      },
      mysqlTags.createTable,
      additionalCause
    ),

    createColumn: wrapAsync(
      async (tableName, field) => {
        if (!field.default && field.required) {
          ProjectError.create(
            mysqlTags.columnDefaultMissing,
            `${tableName}.${field.name} should include a default value`
          ).throw()
        }

        const column = defineColumn(field)

        if (!column) {
          return null
        }

        const query = Seql.query`
          ALTER TABLE ${Seql.table(tableName)}
          ADD ${Seql.raw(column)};
        `

        return await api.exec(query, {
          safe: true,
        })
      },
      mysqlTags.createColumn,
      additionalCause
    ),

    handleRelation: wrapAsync(
      async ([mode, schemaName, fieldName, fieldTo]) => {
        if (mode === 'single') {
          const targetFieldName = `${fieldName}Id`

          const columnExists = await api.exec<BlobType[]>(
            Seql.query`
              SELECT *
              FROM ${Seql.table('INFORMATION_SCHEMA.COLUMNS')}
              WHERE ${
                // biome-ignore lint/style/useNamingConvention: <explanation>
                Seql.and({ TABLE_NAME: schemaName, COLUMN_NAME: targetFieldName })
              };
            `,
            { cache: false }
          )

          if (columnExists.data.length === 0) {
            unwrap(
              await api.operations.createColumn(schemaName, {
                name: targetFieldName,
                type: 'string',
                maxLength: 36,
              })
            )

            return await api.exec(
              Seql.query`         
                ALTER TABLE ${Seql.table(schemaName)}
                ADD CONSTRAINT fk_${Seql.raw(schemaName)}_${Seql.raw(fieldName)}
                FOREIGN KEY (${Seql.raw(targetFieldName)}) REFERENCES ${Seql.raw(fieldTo)}(id);
              `
            )
          }
        } else {
          const relationTableName = `${schemaName}_${fieldName}`

          const tableExists = await api.exec<BlobType[]>(
            Seql.query`
              SELECT *
              FROM ${Seql.table('INFORMATION_SCHEMA.TABLES')}
              WHERE ${Seql.and({
                // biome-ignore lint/style/useNamingConvention: <explanation>
                TABLE_NAME: relationTableName,
              })};
            `,
            { cache: false }
          )

          if (tableExists.data.length === 0) {
            const targetSchemaName = schemaName.endsWith('s') ? schemaName.slice(0, -1) : schemaName
            const targetFieldTo = fieldTo.endsWith('s') ? fieldTo.slice(0, -1) : fieldTo

            return await api.exec(
              Seql.query`
                CREATE TABLE ${Seql.table(relationTableName)} (
                  ${Seql.raw(targetSchemaName)}Id VARCHAR(36) NOT NULL,
                  ${Seql.raw(targetFieldTo)}Id VARCHAR(36) NOT NULL,
                  FOREIGN KEY (${Seql.raw(targetSchemaName)}Id) REFERENCES ${Seql.raw(schemaName)}(id),
                  FOREIGN KEY (${Seql.raw(targetFieldTo)}Id) REFERENCES ${Seql.raw(fieldTo)}(id),
                  PRIMARY KEY (${Seql.raw(targetSchemaName)}Id, ${Seql.raw(targetFieldTo)}Id)
                );
              `
            )
          }
        }

        return null
      },
      mysqlTags.handleRelation,
      additionalCause
    ),
  }
}
