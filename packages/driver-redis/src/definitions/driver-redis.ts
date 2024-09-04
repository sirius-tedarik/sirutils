import type { BlobType } from '@sirutils/core'
import type { Evt } from '@sirutils/safe-toolbox'
import type { RedisClientOptions, RedisClientType } from 'redis'

import type { DriverRedisTags } from '../tag'
import type { createRedisDriver } from '../utils/plugin'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      driverRedis: DriverRedisTags
    }

    interface Env {
      console: 'silent' | 'normal'
    }

    interface PluginDefinitions {
      'driver-redis': Sirutils.PluginSystem.ExtractDefinition<typeof createRedisDriver>
    }

    namespace DriverRedis {
      interface Env {
        host: string
        username: string
        password: string
        port: string
        database?: string
      }

      interface Options {
        ttl?: number
        client: RedisClientOptions
      }

      interface BaseApi {
        $events: Evt<Sirutils.ProjectErrorType>
        $client: RedisClientType
      }

      interface DriverApi {
        get: (...args: string[]) => Promise<(string | null)[]>
        getJson: <T>(...args: string[]) => Promise<T[]>
        set: (...args: [string, string][]) => Promise<string>
        setJson: (...args: [string, string][]) => Promise<string>
        setWithoutTtl: (...args: [string, string][]) => Promise<string>
        setJsonWithoutTtl: (...args: [string, string][]) => Promise<string>
        del: (...args: string[]) => Promise<BlobType>
        scan: (pattern: string, count?: number) => AsyncIterable<string>
      }

      type Context = Sirutils.PluginSystem.Context<
        Sirutils.DriverRedis.Options,
        Sirutils.DriverRedis.BaseApi & Sirutils.DriverRedis.DriverApi
      >
    }
  }
}
