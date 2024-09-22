import { unwrap } from '@sirutils/core'

import { createSyncSchema } from '../src'

const validator = createSyncSchema({
  id: 'ulid',
  username: 'string',
  age: {
    type: 'string',
    optional: true,
    enum: ['sa', 'test'],
  },
})

unwrap(
  validator({
    id: '000XAL6S41ACTAV9WEVGEMMVR8',
    username: 'alice',
  })
) // pass

unwrap(
  validator({
    id: 'test',
    username: 'alice',
  })
) // fail
