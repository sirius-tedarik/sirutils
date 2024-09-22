import { type BlobType, ProjectError, Result, createActions, unwrap } from '@sirutils/core'
import { proxy, safeJsonParse, safeJsonStringify } from '@sirutils/safe-toolbox'

import { driverRedisTags } from '../../tag'

export const cache = new Map<string, BlobType>()

export const driverActions = createActions(
  (context: Sirutils.DriverRedis.Context): Sirutils.DriverRedis.DriverApi => {
    return {
      get: async (...args: string[]) => {
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

      getJson: async (...args: string[]) => {
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
          Result.combine(datas.map(data => (data ? safeJsonParse(data[1] as BlobType) : data)))
        )
      },

      set: async (...args: [string, string][]) => {
        let pipeline = context.api.$client.pipeline()

        for (const [key, value] of args) {
          // biome-ignore lint/style/noNonNullAssertion: Redundant
          pipeline = pipeline.set(key, value, 'EX', context.options.ttl!)
        }

        await pipeline.exec()

        return true
      },

      setJson: async (...args: [string, string][]) => {
        let pipeline = context.api.$client.pipeline()

        for (const [key, value] of args) {
          // biome-ignore lint/style/noNonNullAssertion: Redundant
          pipeline = pipeline.set(key, unwrap(safeJsonStringify(value)), 'EX', context.options.ttl!)
        }

        await pipeline.exec()

        return true
      },

      setWithoutTtl: async (...args: [string, string][]) => {
        let pipeline = context.api.$client.pipeline()

        for (const [key, value] of args) {
          pipeline = pipeline.set(key, value)
        }

        await pipeline.exec()

        return true
      },

      setJsonWithoutTtl: async (...args: [string, string][]) => {
        let pipeline = context.api.$client.pipeline()

        for (const [key, value] of args) {
          pipeline = pipeline.set(key, unwrap(safeJsonStringify(value)))
        }

        await pipeline.exec()

        return true
      },

      del: async (...args: string[]) => {
        let pipeline = context.api.$client.pipeline()

        for (const key of args) {
          pipeline = pipeline.del(key)
        }

        await pipeline.exec()

        return true
      },

      scan: (pattern: string, count?: number) => {
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
