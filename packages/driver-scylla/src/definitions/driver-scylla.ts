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

      interface DriverApi {
        exec: <T>(texts: TemplateStringsArray, ...values: BlobType[]) => Promisify<T[]>
      }

      type Context = Sirutils.PluginSystem.Context<
        Sirutils.DriverScylla.Options,
        Sirutils.DriverScylla.BaseApi & Sirutils.DriverScylla.DriverApi
      >
    }
  }
}
