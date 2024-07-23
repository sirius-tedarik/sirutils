import { type BlobType, ProjectError, type Result, forwardAsync, unwrap } from '@sirutils/core'
import type { TAnySchema } from '@sirutils/schema'
import { Seql } from '@sirutils/seql'
import { diff as justDiff } from 'just-diff'
import mariadb from 'mariadb'

import { get } from 'traverse'
import { logger } from '../internals/logger'
import { mysqlTags } from '../tag'
import { createDBExec } from './internals/db-exec'
import { dbInitialize } from './internals/db-initialize'
import { createDBOperations } from './internals/db-operations'

const getRelations = (schemas: Sirutils.SchemaPlugin.Original[]) => {
  // mode = "single" | "multiple", schema.name, field.name, field.to
  const result: [string, string, string, string][] = []

  for (const schema of schemas) {
    for (const field of schema.fields) {
      if (field.type === 'relation') {
        result.push([field.mode, schema.name, field.name, field.to])
      }
    }
  }

  return result
}

export const createDB = async <T extends TAnySchema, S>(
  options: Sirutils.Mysql.DBOptions<T, S>,
  additionalCause: Sirutils.ErrorValues
): Promise<Sirutils.Mysql.DBApi<S>> =>
  forwardAsync(async () => {
    if (!options.connectionOptions.database) {
      ProjectError.create(mysqlTags.createDBOptions, 'database').throw()
    }

    const db = mariadb.createPool({
      ...options.connectionOptions,
      timezone: 'Z',
      rowsAsArray: false,
      autoJsonMap: true,
    })

    const api = {} as Sirutils.Mysql.DBApi<S>

    Object.assign(api, {
      db,
      cacher: options.cacher,

      exec: createDBExec(api, options, additionalCause),
      operations: createDBOperations(api, options, additionalCause),

      schema: async () => {
        const { data } = await api.exec<'settings[]'>(
          Seql.query`SELECT * FROM ${Seql.table('settings')} WHERE ${Seql.and({ name: 'migration' })}`,
          {
            cache: false,
          }
        )

        if (!data[0]) {
          return null
        }

        return data[0]
      },

      migrate: (_safeOnly = true) =>
        // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
        forwardAsync(async () => {
          const dbResult = ((await api.schema())?.data ?? []).sort((a, b) =>
            a.name.localeCompare(b.name)
          )
          const originals = Object.values(options.schemas)
            .map(value => value.original)
            .sort((a, b) => a.name.localeCompare(b.name))

          const diffs = justDiff(dbResult, originals)
          const execResults: Awaited<ReturnType<Sirutils.Mysql.DBApi<S>['exec']>>[] = []

          let offset = 0

          const commitAll = () => Promise.all(execResults.map(execResult => execResult.commit()))
          const rollbackAll = () =>
            Promise.all(execResults.map(execResult => execResult.rollback()))

          for (const diff of diffs) {
            let result: Result<BlobType, Sirutils.ProjectErrorType> | null = null

            if (diff.op === 'add' && diff.path.length === 1) {
              result = await api.operations.createTable(diff.value)
            } else if (diff.op === 'add' && diff.path[1] === 'fields' && diff.path.length === 3) {
              result = await api.operations.createColumn(
                get(originals, [`${diff.path[0]}`]).name,
                diff.value
              )

              if (result === null) {
                offset += 1
              }
            } else {
              offset += 1
            }

            if (!result) {
              continue
            }

            if (result.isErr()) {
              logger.error(result.error)

              await rollbackAll()

              return
            }

            execResults.push(result.value)
          }

          for (const relation of getRelations(originals)) {
            const result = await api.operations.handleRelation(relation)

            if (result.isErr()) {
              logger.error(result.error)

              await rollbackAll()

              return
            }

            if (result.value) {
              execResults.push(result.value)

              offset -= 1
            }
          }

          if (execResults.length === diffs.length - offset) {
            await commitAll()

            const migrationUpdateResult = await api.exec(
              Seql.query`
                UPDATE ${Seql.table('settings')}
                SET ${Seql.update({
                  data: originals,
                  timestamp: new Date(),
                })}
                WHERE ${Seql.and({ name: 'migration' })}
              `,
              {
                cache: false,
              }
            )

            await migrationUpdateResult.commit()

            return
          }

          if (diffs.length > 0) {
            await rollbackAll()

            ProjectError.create(mysqlTags.migrationCannotComplete, 'some operations missing')
              .appendData(diffs)
              .throw()
          }
        }, mysqlTags.dbMigrate),
    } as Sirutils.Mysql.DBApi<S>)

    unwrap(await dbInitialize(api, options))

    return api
  }, mysqlTags.createDB)
