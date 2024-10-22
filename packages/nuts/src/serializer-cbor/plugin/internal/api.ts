import { createActions } from '@sirutils/core'
import { DecoderStream, EncoderStream } from 'cbor-x'

import { cborTags } from '../../tag'

export const serializerApiActions = createActions(
  (context: Sirutils.Nuts.Cbor.Context): Sirutils.Nuts.Cbor.SerializerApi => {
    return {
      encode: data => {
        return context.api.$encoder.encode(data)
      },
      decode: data => {
        if (typeof data === 'string') {
          return context.api.$decoder.decode(Buffer.from(data))
        }

        return context.api.$decoder.decode(data)
      },

      encodeStream: () => new EncoderStream(context.options),
      decodeStream: () => new DecoderStream(context.options),
    }
  },
  cborTags.api
)
