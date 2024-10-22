import type { Options as CborOptions, Decoder, Encoder } from 'cbor-x'

import type { createCbor } from '../plugin/create'
import type { CborTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      'nuts-cbor': CborTags
    }

    interface PluginDefinitions {
      'nuts-cbor': Sirutils.PluginSystem.ExtractDefinition<typeof createCbor>
    }

    namespace Nuts {
      namespace Cbor {
        interface Options extends CborOptions {}

        interface BaseApi {
          $encoder: Encoder
          $decoder: Decoder
        }

        interface SerializerApi extends Sirutils.Nuts.SerializerApi {}

        type Context = Sirutils.PluginSystem.Context<
          Sirutils.Nuts.Cbor.Options,
          Sirutils.Nuts.Cbor.BaseApi & Sirutils.Nuts.Cbor.SerializerApi
        >
      }
    }
  }
}
