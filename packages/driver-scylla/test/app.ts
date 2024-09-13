import './handler'
import './migrations'

import { redis, scylla } from './drivers'

// const table = scylla.api
//   .query`SELECT ${scylla.api.columns()} FROM ${scylla.api.table('users')} WHERE ${scylla.api.and([
//   {
//     date: scylla.api.comparison(15, 'lt'),
//     date2: scylla.api.comparison(15, 'lte'),
//     date3: scylla.api.comparison(15, 'gt'),
//     date4: scylla.api.comparison(15, 'gte'),
//   },
// ])} ${scylla.api.limit(10)}`

// logger.info(generateCacheKey('sirius', table), table)

// const table = await scylla.api.exec`CREATE TABLE users (
//     id uuid PRIMARY KEY,
//     username text,
//     age varint
//   )`

// const insert = await scylla.api.exec`${scylla.api.insert('users', {
//   id: 'df413f90-7012-4a85-95ca-fca083d6bc5e',
//   username: scylla.api.object({
//     test: 'data',
//   }),
//   age: 1,
// })}`

// const query = await scylla.api
//   .exec`SELECT ${scylla.api.columns(['id', 'age'])} FROM ${scylla.api.table('users')} WHERE ${scylla.api.and(
//   [
//     {
//       username: 'alice',
//     },
//   ]
// )} ALLOW FILTERING`

// const query2 = await scylla.api
//   .exec`SELECT ${scylla.api.columns()} FROM ${scylla.api.table('users')} WHERE ${scylla.api.and([
//   {
//     username: 'alice',
//   },
// ])} ALLOW FILTERING`

// const update = await scylla.api.exec`${scylla.api.update('users', {
//   age: 10,
// })} WHERE ${scylla.api.and([
//   {
//     id: 'df413f90-7012-4a85-95ca-fca083d6bc5e',
//   },
// ])}`

// logger.info(query, query2, update)

// const update = await scylla.api.exec`${scylla.api.update('users', {
//   name: 'yui',
// })} WHERE ${scylla.api.and([
//   {
//     name: 'alice',
//   },
// ])}`

await scylla.api.$client.shutdown()
await redis.api.$client.disconnect()
