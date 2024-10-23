import type { createLogger } from '@sirutils/core'
import type { ConnectionOptions, NatsConnection } from 'nats'

import type { createNats } from '../plugin/create'
import type { NatsTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      'nuts-nats': NatsTags
    }

    interface PluginDefinitions {
      'nuts-nats': Sirutils.PluginSystem.ExtractDefinition<typeof createNats>
    }

    namespace Nuts {
      namespace Nats {
        interface Options extends ConnectionOptions {
          logger?: ReturnType<typeof createLogger>
        }

        interface BaseApi {
          $connection: NatsConnection
        }

        interface TransportApi extends Sirutils.Nuts.TransportApi {}

        type Context = Sirutils.PluginSystem.Context<
          Sirutils.Nuts.Nats.Options,
          Sirutils.Nuts.Nats.BaseApi & Sirutils.Nuts.Nats.TransportApi
        >
      }
    }
  }
}
