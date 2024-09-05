import { type BlobType, Result, createActions, unwrap } from '@sirutils/core'
import { proxy, safeJsonParse, safeJsonStringify } from '@sirutils/safe-toolbox'

import { driverRedisTags } from '../../tag'

export const cache = new Map<string, BlobType>()

export const driverActions = createActions(
  (context: Sirutils.DriverRedis.Context): Sirutils.DriverRedis.DriverApi => {
    return {
      get: async (...args: string[]) => {
        return await context.api.$client.mGet(args)
      },

      getJson: async (...args: string[]) => {
        const datas = await context.api.$client.mGet(args)

        return unwrap(
          Result.combine(
            (datas.filter(data => !!data) as string[]).map(data => safeJsonParse(data))
          )
        )
      },

      set: async (...args: [string, string][]) => {
        const result = await context.api.$client.mSet(args)

        await Promise.all(
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          args.map(([key]) => context.api.$client.expire(key, context.options.ttl!, 'GT'))
        )

        return result
      },

      setJson: async (...args: [string, string][]) => {
        const result = await context.api.$client.mSet(
          args.map(([key, value]) => [key, unwrap(safeJsonStringify(value))])
        )

        await Promise.all(
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          args.map(([key]) => context.api.$client.expire(key, context.options.ttl!, 'GT'))
        )

        return result
      },

      setWithoutTtl: async (...args: [string, string][]) => {
        return await context.api.$client.mSet(args)
      },

      setJsonWithoutTtl: async (...args: [string, string][]) => {
        return await context.api.$client.mSet(
          args.map(([key, value]) => [key, unwrap(safeJsonStringify(value))])
        )
      },

      del: async (...args: string[]) => {
        return await Promise.all(args.map(arg => context.api.$client.del(arg)))
      },

      scan: (pattern: string, count?: number) => {
        return proxy(
          context.api.$client.scanIterator({
            // biome-ignore lint/style/useNamingConvention: redundant
            TYPE: 'string',
            // biome-ignore lint/style/useNamingConvention: redundant
            MATCH: pattern,

            // biome-ignore lint/style/useNamingConvention: redundant
            ...(count ? { COUNT: count } : {}),
          }),
          driverRedisTags.scan
        )
      },
    }
  },
  driverRedisTags.driver
)
