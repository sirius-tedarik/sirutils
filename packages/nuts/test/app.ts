import { ProjectError, createLogger, unwrap } from '@sirutils/core'

import { createNuts } from '../src/core'
import { createCbor } from '../src/serializer-cbor'
import { createNats } from '../src/transport-nats'

const logger = createLogger('?logger')

const serializer = await createCbor()
const transport = await createNats({}, serializer)

export const nuts = await createNuts({}, serializer, transport)

transport.api.listen('test', { type: 'break' }, result => {
  const data = unwrap(result)

  if (data === 'alice') {
    return ProjectError.create('?test', 'this is a test').throw()
  }

  return `Hello ${data}`
})

const response = await transport.api.send('test', 'asuna')

logger.info(response)

await transport.api.send('test', 'alice')
