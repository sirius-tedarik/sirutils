import type { BlobType, Promisify } from '@sirutils/core'
import type { Pool, PoolOptions } from 'mysql2/promise'

import type { DriverMysqlTags } from '../tag'
import type { createMysqlDriver } from '../utils/plugin'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      driverMysql: DriverMysqlTags
    }

    interface PluginDefinitions {
      'driver-mysql': Sirutils.PluginSystem.ExtractDefinition<typeof createMysqlDriver>
    }

    interface DBSchemas {
      settings: {
        id: string
        type: string
        name: string
        value: string
      }
    }

    namespace DriverMysql {
      interface Env {
        mysqlHost: string
        mysqlUsername: string
        mysqlPassword: string
        mysqlDatabase: string
      }

      interface Options {
        pool: PoolOptions
      }

      type BaseApi = Sirutils.Seql.BindedApi &
        Sirutils.Seql.AdapterApi & {
          $client: Pool
        }

      interface ExecWithOptions {
        cache: boolean
      }

      interface DriverApi {
        exec: <T>(texts: TemplateStringsArray, ...values: BlobType[]) => Promisify<T[]>
        execWith: (
          options?: ExecWithOptions
        ) => <T>(texts: TemplateStringsArray, ...values: BlobType[]) => Promisify<T[]>
      }

      type Migration = [
        string,
        string,
        () => Sirutils.ProjectAsyncResult<unknown>,
        () => Sirutils.ProjectAsyncResult<unknown>,
      ]

      interface MigrationApi {
        migration: (
          name: string,
          version: string,
          up: () => Promisify<unknown>,
          down: () => Promisify<unknown>
        ) => Sirutils.DriverMysql.Migration

        up: (migrations: Sirutils.DriverMysql.Migration[], version?: string) => Promisify<void>
        down: (migrations: Sirutils.DriverMysql.Migration[], version?: string) => Promisify<void>
      }

      type Context = Sirutils.PluginSystem.Context<
        Sirutils.DriverMysql.Options,
        Sirutils.DriverMysql.BaseApi &
          Sirutils.DriverMysql.DriverApi &
          Sirutils.DriverMysql.MigrationApi
      >
    }
  }
}
