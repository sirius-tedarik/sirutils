import { type BlobType, Lazy, createActions, group } from '@sirutils/core'
import { proxy, safeJsonStringify } from '@sirutils/safe-toolbox'
import { INSERT, generateCacheKey, seqlTags } from '@sirutils/seql'

import { logger } from '../internal/logger'
import { driverMysqlTags } from '../tag'
import type { RowDataPacket } from 'mysql2/promise'

export const driverActions = createActions(
  (context: Sirutils.DriverMysql.Context): Sirutils.DriverMysql.DriverApi => {
    const redis = context.lookup('driver-redis')

    return {
      exec: <T>(texts: TemplateStringsArray, ...values: BlobType[]) => {
        return context.api.execWith({
          cache: true,
        })<T>(texts, ...values)
      },

      execWith: (
        options = {
          cache: false,
        }
      ) => {
        return <T>(texts: TemplateStringsArray, ...values: BlobType[]) => {
          if (!options.cache) {
            return Lazy.from(async () => {
              const query = context.api.query(texts, ...values)

              const [ rows, _fields ] = proxy(
                await context.api.$client.execute<RowDataPacket[]>(query.text, query.values),
                driverMysqlTags.resultSet,
                true
              )

              rows.map(row => context.api.transformResponse(row))

              return rows as T[]
            })
          }

          // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
          return Lazy.from(async () => {
            const query = context.api.query(texts, ...values)
            const cacheKey = group(() => generateCacheKey(context.api.$client.config.database as string, query))

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
                  `${context.api.$client.config.database as string}#${query.builder.cache.tableName}#*`
                )) {
                  if (query.builder.operations.includes(INSERT)) {
                    list.push(key)

                    logger.info('removed', key)
                  } else {
                    const splitted = key.split('#')
                    const columns = splitted[2]

                    if (
                      splitted.length >= 4 &&
                      // biome-ignore lint/style/noNonNullAssertion: <explanation>
                      query.builder.entries.some(entry => entry.key && columns!.includes(entry.key))
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

            const [ rows, _fields ] = proxy(
              await context.api.$client.execute<RowDataPacket[]>(query.text, query.values),
              driverMysqlTags.resultSet,
              true
            )

            if (cacheKey.isOk()) {
              const stringified = safeJsonStringify(
                rows.map(row => context.api.transformResponse(row))
              )

              if (stringified.isOk()) {
                redis.set([cacheKey.value, stringified.value])
              }
            }

            return rows as T[]
          })
        }
      },
    }
  },
  driverMysqlTags.driver
)
