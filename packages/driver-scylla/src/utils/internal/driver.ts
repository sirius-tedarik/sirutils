import {
  type BlobType,
  Lazy,
  type Promisify,
  capsule,
  coreTags,
  createActions,
  group,
} from '@sirutils/core'
import { proxy, safeJsonStringify } from '@sirutils/safe-toolbox'
import { INSERT, generateCacheKey, seqlTags } from '@sirutils/seql'

import { logger } from '../../internal/logger'
import { driverScyllaTags } from '../../tag'

export const driverActions = createActions(
  (context: Sirutils.DriverScylla.Context): Sirutils.DriverScylla.DriverApi => {
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

              const result = proxy(
                await context.api.$client.execute(query.text, query.values, {
                  prepare: true,
                }),
                driverScyllaTags.resultSet,
                true
              )

              if (result.rows) {
                result.rows.map(row => context.api.transformResponse(row))

                return result.rows as T[]
              }

              return []
            })
          }

          // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
          return Lazy.from(async () => {
            const query = context.api.query(texts, ...values)
            const cacheKey = group(() => generateCacheKey(context.api.$client.keyspace, query))

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

                for await (const key of redis.scan(
                  `${context.api.$client.keyspace}#${query.builder.cache.tableName}#*`
                )) {
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

                if (list.length > 0) {
                  await redis.del(...list)

                  list = []
                }
              }
            }

            const result = proxy(
              await context.api.$client.execute(query.text, query.values, {
                prepare: true,
              }),
              driverScyllaTags.resultSet,
              true
            )

            if (!result.rows) {
              result.rows = []
            }

            if (cacheKey.isOk()) {
              const stringified = safeJsonStringify(
                result.rows.map(row => context.api.transformResponse(row))
              )

              if (stringified.isOk()) {
                redis.set([cacheKey.value, stringified.value])
              }
            }

            return result.rows as T[]
          })
        }

        return capsule(
          fn,
          `${driverScyllaTags.driver}#execWith` as Sirutils.ErrorValues,
          coreTags.createActions
        )
      },
    }
  },
  driverScyllaTags.driver
)
