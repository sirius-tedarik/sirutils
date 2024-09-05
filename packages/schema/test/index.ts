import { unwrap } from '@sirutils/core'

import { createSyncSchema } from '../src'

const validator = createSyncSchema({
  id: 'ulid',
  username: 'string',
  age: {
    type: 'number',
    optional: true,
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
    age: 5,
  })
) // fail
