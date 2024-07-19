import type { BlobType } from '@sirutils/core'
import type { TAnySchema } from '@sirutils/schema'
import type { RedisOptions } from 'ioredis'
import type { Pool, PoolConfig } from 'mariadb'

import type { MysqlTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      driverMysql: MysqlTags
    }

    namespace Schema {
      namespace Generated {
        interface Tables {
          settings: {
            id: number
            name: string
            data: Record<string, Sirutils.SchemaPlugin.Original>
            timestamp: number
          }
        }
      }
    }

    namespace Mysql {
      interface QueryOptions {
        parallel?: boolean
        cache?: boolean
        safe?: boolean
        prefix?: boolean
      }

      interface QueryResult<T> {
        data: T
        rollback: () => Promise<void>
        commit: () => Promise<void>
      }

      interface DBOptions<T extends TAnySchema, S> {
        cacher: CacherApi<S>
        connectionOptions: PoolConfig
        schemas: Record<string, Sirutils.SchemaPlugin.Output<T>>
      }

      interface DBApi<S> {
        db: Pool
        cacher: CacherApi<S>

        exec: <T>(
          seql: Sirutils.Seql.Query,
          options?: QueryOptions
        ) => Promise<
          Sirutils.Mysql.QueryResult<
            IsBoth<T> | IsMultiple<T> | IsOptional<T> | IsDirect<T> extends undefined
              ? T
              : IsBoth<T> | IsMultiple<T> | IsOptional<T> | IsDirect<T>
          >
        >
        schema: () => Promise<Record<string, Sirutils.SchemaPlugin.Original>>
      }

      interface CacherOptions<T extends 'redis'> {
        prefix: string

        connectionOptions?: T extends 'redis' ? RedisOptions : never
      }

      interface CacherApi<S> {
        store: S

        set: <T extends Record<string, BlobType>>(
          entries: T extends BlobType[] ? never : T
        ) => Promise<void>
        get: <T extends string>(keys: string[]) => Promise<T[]>
        delete: (keys: string[]) => Promise<void>
        match: <T extends string>(
          pattern: string[],
          cb: (key: string, value: T, complete: () => void) => Promise<void> | void,
          mode?: 'all' | 'anyof'
        ) => Promise<void>
      }

      type IsDirect<T> = T extends keyof Sirutils.Schema.Generated.Tables
        ? Sirutils.Schema.Generated.Tables[T]
        : never

      type IsMultiple<T> = T extends `${infer U}[]`
        ? U extends keyof Sirutils.Schema.Generated.Tables
          ? Sirutils.Schema.Generated.Tables[U][]
          : never
        : never

      type IsOptional<T> = T extends `?${infer U}`
        ? U extends keyof Sirutils.Schema.Generated.Tables
          ? Sirutils.Schema.Generated.Tables[U] | undefined
          : never
        : never

      type IsBoth<T> = T extends `?${infer U}[]`
        ? U extends keyof Sirutils.Schema.Generated.Tables
          ? Sirutils.Schema.Generated.Tables[U][] | undefined
          : never
        : never
    }
  }
}
