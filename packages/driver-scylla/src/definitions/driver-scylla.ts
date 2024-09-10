import type { BlobType, Promisify } from '@sirutils/core'
import type { Client, DseClientOptions } from 'cassandra-driver'

import type { DriverScyllaTags } from '../tag'
import type { createScyllaDriver } from '../utils/plugin'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      driverScylla: DriverScyllaTags
    }

    interface PluginDefinitions {
      'driver-scylla': Sirutils.PluginSystem.ExtractDefinition<typeof createScyllaDriver>
    }

    interface DBSchemas {
      settings: {
        id: string
        type: string
        name: string
        value: string
      }
    }

    namespace DriverScylla {
      interface Env {
        scyllaContactPoints: string[]
        scyllaLocalDataCenter: string
        scyllaUsername: string
        scyllaPassword: string
      }

      interface Options {
        client: DseClientOptions
      }

      type BaseApi = Sirutils.Seql.BindedApi &
        Sirutils.Seql.AdapterApi & {
          $client: Client
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
        ) => Sirutils.DriverScylla.Migration

        up: (migrations: Sirutils.DriverScylla.Migration[], version?: string) => Promisify<void>
        down: (migrations: Sirutils.DriverScylla.Migration[], version?: string) => Promisify<void>
      }

      type Context = Sirutils.PluginSystem.Context<
        Sirutils.DriverScylla.Options,
        Sirutils.DriverScylla.BaseApi &
          Sirutils.DriverScylla.DriverApi &
          Sirutils.DriverScylla.MigrationApi
      >
    }
  }
}
