import {
  type BlobType,
  Lazy,
  type Promisify,
  capsule,
  coreTags,
  createActions,
  group,
} from '@sirutils/core'
import { isArray, proxy } from '@sirutils/safe-toolbox'
import { INSERT, generateCacheKey, seqlTags } from '@sirutils/seql'

import { logger } from '../../internal/logger'
import { driverMysqlTags } from '../../tag'

export const driverActions = createActions(
  (context: Sirutils.DriverMysql.Context): Sirutils.DriverMysql.DriverApi => {
    const redis = context.lookup('driver-redis')

    return {
      exec: <T>(texts: TemplateStringsArray, ...values: BlobType[]) => {
        return context.api.execWith<T>({
          cache: true,
        })(texts, ...values)
      },

      execWith: <T>(
        options = {
          cache: false,
        }
      ) => {
        const fn = (texts: TemplateStringsArray, ...values: BlobType[]): Promisify<T[]> => {
          if (!options.cache) {
            return Lazy.from(async () => {
              const query = context.api.query(texts, ...values)

              const [rows] = proxy(
                await context.api.$client.query(query.text, query.values),
                driverMysqlTags.resultSet,
                true
              )

              if (!isArray(rows)) {
                return []
              }

              return (rows as T[]).map(row => context.api.transformResponse(row))
            })
          }

          // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
          return Lazy.from(async () => {
            const query = context.api.query(texts, ...values)
            const cacheKey = group(() =>
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              generateCacheKey(context.api.$client.config.database!, query)
            )

            if (cacheKey.isOk()) {
              const cachedData = (await redis.getJson<T[]>(cacheKey.value))[0]

              if (cachedData) {
                return cachedData
              }

              await redis.del(cacheKey.value)
            }

            if (cacheKey.isErr()) {
              if (cacheKey.error.name === seqlTags.cacheEvicted) {
                let list: string[] = []

                for await (const keys of redis.scan(
                  `${context.api.$client.config.database}#${query.builder.cache.tableName}#*`
                )) {
                  for (const key of keys) {
                    if (query.builder.operations.includes(INSERT)) {
                      list.push(key)

                      logger.info('removed', key)
                    } else {
                      const splitted = key.split('#')
                      const columns = splitted[2]

                      if (
                        splitted.length >= 4 &&
                        query.builder.entries.some(
                          // biome-ignore lint/style/noNonNullAssertion: <explanation>
                          entry => entry.key && columns!.includes(entry.key)
                        )
                      ) {
                        list.push(key)
                        logger.info('removed', key)
                      } else if (splitted.length < 4) {
                        list.push(key)
                        logger.info('removed', key)
                      }
                    }

                    if (list.length > 100) {
                      await redis.del(...list)

                      list = []
                    }
                  }
                }

                if (list.length > 0) {
                  await redis.del(...list)

                  list = []
                }
              }
            }

            const [rows] = proxy(
              await context.api.$client.query(query.text, query.values),
              driverMysqlTags.resultSet,
              true
            )

            if (!isArray(rows)) {
              return []
            }

            if (cacheKey.isOk()) {
              const transformed = (rows as T[]).map(row => context.api.transformResponse(row))

              await redis.setJson([cacheKey.value, transformed])
            }

            return rows as T[]
          })
        }

        return capsule(
          fn,
          `${driverMysqlTags.driver}#execWith` as Sirutils.ErrorValues,
          coreTags.createActions
        )
      },
    }
  },
  driverMysqlTags.driver
)
