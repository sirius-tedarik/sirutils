import type { Duplex } from 'node:stream'
import type { BlobType } from '@sirutils/core'

import type { createNuts } from '../plugin/create'
import type { NutsTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      nuts: NutsTags
    }

    interface PluginDefinitions {
      nuts: Sirutils.PluginSystem.ExtractDefinition<typeof createNuts>
      'nuts-serializer': Sirutils.PluginSystem.Context<BlobType, Sirutils.Nuts.SerializerApi>
    }

    namespace Nuts {
      interface Options {
        id?: string
        environment?: 'production' | 'development' | 'test'

        port?: string
        host?: string
        logs?: boolean
      }

      interface Broker {}

      interface BaseApi {}
      interface BrokerApi {
        broker: Sirutils.Nuts.Broker
      }

      type Context = Sirutils.PluginSystem.Context<
        Sirutils.Nuts.Options,
        Sirutils.Nuts.BaseApi & Sirutils.Nuts.BrokerApi
      >

      interface SerializerApi {
        encode: <T = unknown>(data: T) => Buffer
        decode: <T = unknown>(data: string | Buffer) => T

        encodeStream: () => Duplex
        decodeStream: () => Duplex
      }
    }
  }
}
