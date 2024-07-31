import { type BlobType, forwardAsync } from '@sirutils/core'
import type { TAnySchema } from '@sirutils/schema'
import { Seql } from '@sirutils/seql'
import { dayjs } from '@sirutils/toolbox'
import { EJSON } from 'bson'
import traverse from 'traverse'

import { applyCustomPrefix, dummyAsyncFn } from '../../internals/utils'
import { mysqlTags } from '../../tag'

/**
 * fix utc dates (mariadb connectors convert dates)
 **/
const fixDates = (data: BlobType) => {
  // biome-ignore lint/complexity/noForEach: <explanation>
  traverse(data).forEach(function (x) {
    if (x instanceof Date) {
      this.update(dayjs(x).add(dayjs().utcOffset(), 'm').toDate())
    }
  })

  return data
}

export const createDBExec = <T extends TAnySchema, S>(
  api: Sirutils.Mysql.DBApi<S>,
  options: Sirutils.Mysql.DBOptions<T, S>,
  additionalCause: Sirutils.ErrorValues
): Sirutils.Mysql.DBApi<S>['exec'] => {
  return (seql, execOptions = {}) => {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const key = applyCustomPrefix(Seql.generateCacheKey(seql)!)

    const isCacheable =
      seql.builder.operations.every(
        operation => !!Seql.symbols.CACHEABLE_OPERATIONS.includes(operation)
      ) &&
      !!key &&
      seql.builder.operations.length > 0

    execOptions.safe = typeof execOptions.safe === 'undefined' ? !isCacheable : execOptions.safe
    execOptions.cache = typeof execOptions.cache === 'undefined' ? isCacheable : execOptions.cache

    const handleCache = (data: unknown) =>
      forwardAsync(async () => {
        if (execOptions.cache) {
          await options.cacher.set({
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            [key!]: EJSON.stringify(data),
          })

          return
        }

        const patterns = seql.builder.entries.reduce(
          (acc, curr) => {
            if (curr[0]?.endsWith('#')) {
              if (curr[0] !== '+#') {
                acc[0]?.push(`#*${curr[0].slice(0, -1)}*#`)
              }
            } else if (curr[0] && curr[2]) {
              acc[1]?.push(`*${curr[0]}:${curr[1]}*`)
            }

            return acc
          },
          [[], []] as string[][]
        )

        await options.cacher.match(patterns, key => {
          return options.cacher.delete([key])
        })
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

        const connection = await api.db.getConnection()

        if (execOptions.safe) {
          await connection.beginTransaction()
        }

        let data = await connection.execute(
          {
            sql: seql.text,
            metaAsArray: false,
          },
          seql.values.map(x =>
            x instanceof Date ? dayjs(x).utc().format('YYYY-MM-DD HH:mm:ss') : x
          )
        )

        if (Array.isArray(data)) {
          data = fixDates([...data])
        } else if (typeof data === 'object' && data !== null) {
          data = fixDates({ ...data })
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
  }
}
