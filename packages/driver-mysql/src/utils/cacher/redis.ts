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

    match: (patterns, cb, mode = 'all') =>
      forwardAsync(
        async () => {
          const stream = store.scanStream({
            type: '',
          })
          const complete = () => stream.destroy()
          const prefixedPatterns = patterns

          stream.on('data', async (keys: string[]) => {
            stream.pause()
            for (const key of keys) {
              if (
                key.startsWith(options.prefix) &&
                micromatch[mode === 'anyof' ? 'isMatch' : 'all'](key, prefixedPatterns)
              ) {
                await cb(key, (await store.get(key)) as BlobType, complete)
              }
            }
            stream.resume()
          })
        },
        mysqlTags.cacherMatch,
        mysqlTags.createRedisCacher
      ),
  }
}
