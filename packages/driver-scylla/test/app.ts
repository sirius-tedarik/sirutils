import { group } from '@sirutils/core'

import { logger } from '../src/internal/logger'
import { scylla } from './drivers'

const app = await group(async () => {
  // const table = await scylla.api.exec`CREATE TABLE users (
  //     id uuid PRIMARY KEY,
  //     username text,
  //     age varint
  //   )`

  const insert = await scylla.api.exec`${scylla.api.insert('users', {
    id: 'df413f90-7012-4a85-95ca-fca083d6bc5e',
    username: 'alice',
    age: 1,
  })}`

  const query = await scylla.api
    .exec`SELECT ${scylla.api.columns(['id', 'age'])} FROM ${scylla.api.table('users')} WHERE ${scylla.api.and(
    [
      {
        username: 'alice',
      },
    ]
  )} ALLOW FILTERING`

  const query2 = await scylla.api
    .exec`SELECT ${scylla.api.columns()} FROM ${scylla.api.table('users')} WHERE ${scylla.api.and([
    {
      username: 'alice',
    },
  ])} ALLOW FILTERING`

  const update = await scylla.api.exec`${scylla.api.update('users', {
    age: 10,
  })} WHERE ${scylla.api.and([
    {
      id: 'df413f90-7012-4a85-95ca-fca083d6bc5e',
    },
  ])}`

  logger.info(query, query2, update)
}, '?app')

if (app.isErr()) {
  logger.error(app.error.stringify())
}

// const update = await scylla.api.exec`${scylla.api.update('users', {
//   name: 'yui',
// })} WHERE ${scylla.api.and([
//   {
//     name: 'alice',
//   },
// ])}`

await scylla.api.$client.shutdown()
