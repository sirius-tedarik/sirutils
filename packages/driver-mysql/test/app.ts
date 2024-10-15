import './handler'
import './migrations'

import { ulid } from '@sirutils/safe-toolbox'
import { logger } from '../src/internal/logger'
import { mysql, redis } from './drivers'

const insert = await mysql.api.exec`${mysql.api.insert<Sirutils.DBSchemas['users']['0.1.1']>(
  'users',
  {
    id: ulid(),
    name: 'yui',
    surname: '',
    logins: new Date(),
    roles: 'admin,user',
  }
)}`

const result = await mysql.api.exec`
    SELECT ${mysql.api.columns()} FROM ${mysql.api.table('users')}
    WHERE ${mysql.api.and([
      {
        name: 'yui',
      },
    ])} ${mysql.api.limit(1)}`

const result2 = await mysql.api.exec`
    SELECT ${mysql.api.columns()} FROM ${mysql.api.table('users')}
    WHERE ${mysql.api.and([
      {
        name: 'yui',
      },
    ])} ${mysql.api.limit(1)}`

logger.info(result, result2)

// const table = mysql.api
//   .query`SELECT ${mysql.api.columns()} FROM ${mysql.api.table('users')} WHERE ${mysql.api.and([
//   {
//     date: mysql.api.comparison(15, 'lt'),
//     date2: mysql.api.comparison(15, 'lte'),
//     date3: mysql.api.comparison(15, 'gt'),
//     date4: mysql.api.comparison(15, 'gte'),
//   },
// ])} ${mysql.api.limit(10)}`

// logger.info(generateCacheKey('sirius', table), table)

// const table = await mysql.api.exec`CREATE TABLE users (
//     id uuid PRIMARY KEY,
//     username text,
//     age varint
//   )`

// const query = await mysql.api
//   .exec`SELECT ${mysql.api.columns([])} FROM ${mysql.api.table('users')} WHERE ${mysql.api.and([
//   {
//     name: 'alice',
//   },
// ])} ALLOW FILTERING`

// logger.info(query)

// const query2 = await mysql.api
//   .exec`SELECT ${mysql.api.columns()} FROM ${mysql.api.table('users')} WHERE ${mysql.api.and([
//   {
//     username: 'alice',
//   },
// ])} ALLOW FILTERING`

// const update = await mysql.api.exec`${mysql.api.update('users', {
//   age: 10,
// })} WHERE ${mysql.api.and([
//   {
//     id: 'df413f90-7012-4a85-95ca-fca083d6bc5e',
//   },
// ])}`

// logger.info(query, query2, update)

// const update = await mysql.api.exec`${mysql.api.update('users', {
//   name: 'yui',
// })} WHERE ${mysql.api.and([
//   {
//     name: 'alice',
//   },
// ])}`

await mysql.api.$client.end()
await redis.api.$client.quit()
