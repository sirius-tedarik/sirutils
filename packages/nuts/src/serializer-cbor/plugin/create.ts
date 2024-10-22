import { createPlugin } from '@sirutils/core'
import { Decoder, Encoder } from 'cbor-x'

import { cborTags } from '../tag'
import { serializerApiActions } from './internal/api'

export const createCbor = createPlugin<Sirutils.Nuts.Cbor.Options, Sirutils.Nuts.Cbor.BaseApi>(
  {
    name: 'nuts-serializer', // cbor
    version: '0.2.3',

    dependencies: {},
  },
  context => {
    const $encoder = new Encoder(context.options)
    const $decoder = new Decoder(context.options)

    return {
      $encoder,
      $decoder,
    }
  },
  cborTags.plugin,
  {}
)
  .register(serializerApiActions)
  .lock()
