import { type BlobType, createActions } from '@sirutils/core'
import { proxy } from '@sirutils/safe-toolbox'

import { driverRedisTags } from '../../tag'

export const cache = new Map<string, BlobType>()

export const driverActions = createActions(
  (context: Sirutils.DriverRedis.Context): Sirutils.DriverRedis.DriverApi => {
    return {
      get: async (...args: string[]) => {
        return await context.api.$client.mGet(args)
      },

      set: async (...args: [string, string][]) => {
        return await context.api.$client.mSet(args)
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
            COUNT: count,
          }),
          driverRedisTags.scan
        )
      },
    }
  },
  driverRedisTags.driver
)
