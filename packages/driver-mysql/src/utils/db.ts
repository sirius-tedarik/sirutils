import { type BlobType, ProjectError, forwardAsync } from '@sirutils/core'
import { Seql } from '@sirutils/seql'
import mariadb from 'mariadb'

import { EJSON } from 'bson'
import { logger } from '../internals/logger'
import { mysqlTags } from '../tag'

const dummyAsyncFn = () => Promise.resolve()
const applyCustomPrefix = (key: string | null, prefix?: string) => {
  if (!key) {
    return null
  }

  if (prefix) {
    return `${prefix}.${key}`
  }

  return key
}

export const createDB = async <S>(
  options: Sirutils.Mysql.DBOptions<S>,
  additionalCause: Sirutils.ErrorValues
): Promise<Sirutils.Mysql.DBApi<S>> =>
  forwardAsync(async () => {
    if (!options.connectionOptions.database) {
      ProjectError.create(mysqlTags.createDBOptions, 'database').throw()
    }

    const db = mariadb.createPool({
      ...options.connectionOptions,
      timezone: '+00:00',
      rowsAsArray: true,
      autoJsonMap: true,
    })

    const api: Sirutils.Mysql.DBApi<S> = {
      db,
      cacher: options.cacher,

      exec: (seql, execOptions = {}) => {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const key = applyCustomPrefix(Seql.generateCacheKey(seql)!)

        const isCacheable =
          seql.builder.operations.every(
            operation => !!Seql.symbols.CACHEABLE_OPERATIONS.includes(operation)
          ) && !!key

        execOptions.safe = typeof execOptions.safe === 'undefined' ? !isCacheable : execOptions.safe
        execOptions.cache =
          typeof execOptions.cache === 'undefined' ? isCacheable : execOptions.cache

        const handleCache = (data: unknown) =>
          forwardAsync(async () => {
            if (isCacheable) {
              await options.cacher.set({
                // biome-ignore lint/style/noNonNullAssertion: <explanation>
                [key!]: EJSON.stringify(data),
              })

              return
            }

            const patterns = seql.builder.entries.reduce((acc, curr) => {
              if (curr[2] && curr[0]) {
                acc.push(`*${curr[0]}:${curr[1]}*`)
              }

              return acc
            }, [] as string[])

            options.cacher.match(
              patterns,
              key => {
                options.cacher.delete([key])
              },
              'anyof'
            )
          }, mysqlTags.dbExecHandleCache)

        return forwardAsync(
          // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
          async () => {
            if (execOptions.cache) {
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              const data = (await options.cacher.get([key!]))[0]

              if (data) {
                return {
                  data: EJSON.parse(data),
                  commit: dummyAsyncFn,
                  rollback: dummyAsyncFn,
                }
              }
            }

            const connection = await db.getConnection()

            if (execOptions.safe) {
              await connection.beginTransaction()
            }

            let data = await connection.execute(
              {
                sql: seql.text,
                metaAsArray: false,
              },
              seql.values
            )

            if (Array.isArray(data)) {
              data = [...data]
            } else if (typeof data === 'object' && data !== null) {
              data = { ...data }
            }

            if (!execOptions.safe) {
              await connection.release()

              await handleCache(data)
            }

            return {
              data,
              commit: execOptions.safe
                ? async () => {
                    await connection.commit()
                    await connection.release()

                    await handleCache(data)
                  }
                : dummyAsyncFn,
              rollback: execOptions.safe
                ? async () => {
                    await connection.rollback()
                    await connection.release()

                    await handleCache(data)
                  }
                : dummyAsyncFn,
            }
          },
          mysqlTags.dbExec,
          additionalCause
        )
      },

      schema: async () => {
        const { data } = await api.exec<'settings[]'>(
          Seql.query`SELECT * FROM ${Seql.table('settings')} WHERE ${Seql.and({ name: 'migration' })}`
        )

        if (!data[0]) {
          return {}
        }

        return data
      },
    }

    await forwardAsync(async () => {
      const exists = await api.exec<BlobType[]>(Seql.query`
        SELECT *
        FROM ${Seql.table('INFORMATION_SCHEMA.TABLES')}
        WHERE ${Seql.and({
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          // biome-ignore lint/style/useNamingConvention: <explanation>
          TABLE_SCHEMA: options.connectionOptions.database!,
          // biome-ignore lint/style/useNamingConvention: <explanation>
          TABLE_NAME: 'settings',
        })};
      `)

      if (exists.data?.length === 0) {
        logger.info('initializing database')

        await api.exec(
          Seql.query`
            CREATE TABLE ${Seql.table('settings')} (
              id INT auto_increment NOT NULL,
              name varchar(255) NOT NULL,
              data json NOT NULL,
              timestamp DATETIME NOT NULL,
              CONSTRAINT settings_pk PRIMARY KEY (id)
            );
          `,
          {
            safe: true,
          }
        )
      }
    }, mysqlTags.createDBInitialize)

    return api
  }, mysqlTags.createDB)
