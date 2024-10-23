import type { BlobType } from '@sirutils/core'
import type { Duplex } from 'node:stream'

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
      'nuts-transport': Sirutils.PluginSystem.Context<BlobType, Sirutils.Nuts.TransportApi>
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

      interface TransportApiMethodOptions {
        send: {
          timeout?: number
        }
        listen: {
          queue?: string
          max?: number
          timeout?: number
          type?: 'break' | 'tolerate' | 'log'
        }
      }

      interface TransportApi {
        send: <R>(
          subject: string,
          data: BlobType,
          options?: Sirutils.Nuts.TransportApiMethodOptions['send']
        ) => Promise<R>
        listen: <T, R>(
          subject: string,
          options: Sirutils.Nuts.TransportApiMethodOptions['listen'],
          callback: (result: Sirutils.ProjectResult<T>) => R | Promise<R>
        ) => (max?: number) => void
      }
    }
  }
}
