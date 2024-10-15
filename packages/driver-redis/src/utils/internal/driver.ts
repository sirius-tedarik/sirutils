import { type BlobType, ProjectError, Result, createActions, ok, unwrap } from '@sirutils/core'
import { proxy, safeEjsonParse, safeEjsonStringify } from '@sirutils/safe-toolbox'

import { driverRedisTags } from '../../tag'

export const cache = new Map<string, BlobType>()

export const driverActions = createActions(
  (context: Sirutils.DriverRedis.Context): Sirutils.DriverRedis.DriverApi => {
    return {
      get: async (...args) => {
        let pipeline = context.api.$client.pipeline()

        for (const key of args) {
          pipeline = pipeline.get(key)
        }

        const datas = await pipeline.exec()

        if (!datas || datas.some(data => data[0] !== null)) {
          return ProjectError.create(
            driverRedisTags.invalidResponse,
            'some keys are does return invalid result'
          ).throw()
        }

        return datas.map(data => data[1] as string)
      },

      getJson: async (...args) => {
        let pipeline = context.api.$client.pipeline()

        for (const key of args) {
          pipeline = pipeline.get(key)
        }

        const datas = await pipeline.exec()

        if (!datas) {
          return ProjectError.create(
            driverRedisTags.invalidResponse,
            'some keys are does return invalid result'
          ).throw()
        }

        return unwrap(
          Result.combine(
            datas.map(([_err, data]) => (data ? safeEjsonParse(data as BlobType) : ok(data)))
          )
        )
      },

      set: async (...args) => {
        let pipeline = context.api.$client.pipeline()

        for (const [key, value] of args) {
          // biome-ignore lint/style/noNonNullAssertion: Redundant
          pipeline = pipeline.set(key, value, 'EX', context.options.ttl!)
        }

        await pipeline.exec()

        return true
      },

      setJson: async (...args) => {
        let pipeline = context.api.$client.pipeline()

        for (const [key, value] of args) {
          pipeline = pipeline.set(
            key,
            unwrap(safeEjsonStringify(value)),
            'EX',
            // biome-ignore lint/style/noNonNullAssertion: Redundant
            context.options.ttl!
          )
        }

        await pipeline.exec()

        return true
      },

      setWithoutTtl: async (...args) => {
        let pipeline = context.api.$client.pipeline()

        for (const [key, value] of args) {
          pipeline = pipeline.set(key, value)
        }

        await pipeline.exec()

        return true
      },

      setJsonWithoutTtl: async (...args) => {
        let pipeline = context.api.$client.pipeline()

        for (const [key, value] of args) {
          pipeline = pipeline.set(key, unwrap(safeEjsonStringify(value)))
        }

        await pipeline.exec()

        return true
      },

      del: async (...args) => {
        let pipeline = context.api.$client.pipeline()

        for (const key of args) {
          pipeline = pipeline.del(key)
        }

        await pipeline.exec()

        return true
      },

      scan: (pattern, count) => {
        return proxy(
          context.api.$client.scanStream({
            type: 'string',
            match: pattern,
            ...(count ? { count } : {}),
          }),
          driverRedisTags.scan
        )
      },
    }
  },
  driverRedisTags.driver
)
