import { type BlobType, forwardAsync } from '@sirutils/core'
import { Redis } from 'ioredis'
import micromatch from 'micromatch'
import { mysqlTags } from '../../tag'

export const createRedisCacher = (
  options = {} as Sirutils.Mysql.CacherOptions<'redis'>
): Sirutils.Mysql.CacherApi<Redis> => {
  const store = new Redis(options.connectionOptions ?? {})

  return {
    store,

    get: keys =>
      forwardAsync(
        async () => {
          return (await store.mget(
            keys.map(key => (key.startsWith(options.prefix) ? key : `${options.prefix}#${key}`))
          )) as BlobType[]
        },
        mysqlTags.cacherGet,
        mysqlTags.createRedisCacher
      ),

    set: record =>
      forwardAsync(
        async () => {
          const data: Record<string, string> = {}

          for (const key of Object.keys(record)) {
            data[key.startsWith(options.prefix) ? key : `${options.prefix}#${key}`] = record[key]
          }

          await store.mset(data)
        },
        mysqlTags.cacherSet,
        mysqlTags.createRedisCacher
      ),

    delete: keys =>
      forwardAsync(
        async () => {
          await store.del(
            keys.map(key => (key.startsWith(options.prefix) ? key : `${options.prefix}#${key}`))
          )
        },
        mysqlTags.cacherDelete,
        mysqlTags.createRedisCacher
      ),

    match: (patterns, cb) =>
      forwardAsync(
        () =>
          new Promise((resolve, reject) => {
            const stream = store.scanStream({
              type: '',
            })
            const complete = () => stream.destroy()
            const [all, anyof] = patterns
            // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
            stream.on('data', async (keys: string[]) => {
              stream.pause()
              for (const key of keys) {
                if (
                  key.startsWith(options.prefix) &&
                  // biome-ignore lint/style/noNonNullAssertion: <explanation>
                  (all?.length === 0 ? true : micromatch.all(key, all!)) &&
                  // biome-ignore lint/style/noNonNullAssertion: <explanation>
                  (anyof?.length === 0 ? true : micromatch.isMatch(key, anyof!))
                ) {
                  await cb(key, (await store.get(key)) as BlobType, complete)
                }
              }
              stream.resume()
            })

            stream.on('end', () => {
              resolve()
            })

            stream.on('error', err => reject(err))
          }),
        mysqlTags.cacherMatch,
        mysqlTags.createRedisCacher
      ),
  }
}
