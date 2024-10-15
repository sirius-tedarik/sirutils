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
  roles: {
    type: 'array',
    items: 'string',
    enum: ['test', 'example'],
    optional: true,
  },
  enum: {
    type: 'enum',
    values: ['hello', 'hi'],
  },

  status: {
    type: 'multi',
    rules: [
      { type: 'boolean' },
      {
        type: 'array',
        items: {
          type: 'number',
        },
      },
    ],
    default: true,
    optional: true,
  },
})

unwrap(
  validator({
    id: '000XAL6S41ACTAV9WEVGEMMVR8',
    username: 'alice',
    age: 'test',
    enum: 'hello',
    roles: ['example'],
    status: [16],
  })
) // pass

unwrap(
  validator({
    id: 'test',
    username: 'alice',
    enum: 'hi',
  })
) // fail
