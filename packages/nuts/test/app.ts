import { createNuts } from '../src/core'
import { createCbor } from '../src/serializer-cbor'

const [serializer] = await Promise.all([createCbor()])

export const nuts = await createNuts({}, serializer)
