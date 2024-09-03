import type { BlobType } from '@sirutils/core'
import type { Client, DseClientOptions, types } from 'cassandra-driver'

import type { DriverScyllaTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      driverScylla: DriverScyllaTags
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

      interface BaseApi extends Sirutils.Seql.BindedApi {
        $client: Client
      }

      interface Api {
        exec: (texts: TemplateStringsArray, ...values: BlobType[]) => Promise<types.ResultSet>
      }

      type Context = Sirutils.PluginSystem.Context<
        Sirutils.DriverScylla.Options,
        Sirutils.DriverScylla.BaseApi & Sirutils.DriverScylla.Api
      >
    }
  }
}
