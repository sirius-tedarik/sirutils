import type { Evt } from '@sirutils/safe-toolbox'
import type { Redis, RedisOptions } from 'ioredis'

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
        redisHost: string
        redisPort: number
        redisDatabase: number
        redisUsername: string
        redisPassword: string
      }

      interface Options {
        ttl?: number
        client: RedisOptions
      }

      interface BaseApi {
        $events: Evt<Sirutils.ProjectErrorType>
        $client: Redis
      }

      interface DriverApi {
        get: (...args: string[]) => Promise<(string | null)[]>
        getJson: <T>(...args: string[]) => Promise<(T | null)[]>
        set: (...args: [string, string][]) => Promise<true>
        setJson: (...args: [string, string][]) => Promise<true>
        setWithoutTtl: (...args: [string, string][]) => Promise<true>
        setJsonWithoutTtl: (...args: [string, string][]) => Promise<true>
        del: (...args: string[]) => Promise<true>
        scan: (pattern: string, count?: number) => AsyncIterable<string[]>
      }

      type Context = Sirutils.PluginSystem.Context<
        Sirutils.DriverRedis.Options,
        Sirutils.DriverRedis.BaseApi & Sirutils.DriverRedis.DriverApi
      >
    }
  }
}
