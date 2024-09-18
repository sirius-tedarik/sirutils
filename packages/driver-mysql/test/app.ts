import './handler'
import './migrations'

import { redis, mysql } from './drivers'
import { logger } from '../src/internal/logger'

const table = await mysql.api.exec`CREATE TABLE IF NOT EXISTS users (
    id int,
    username varchar(255)
);`

const insert = await mysql.api.exec`${mysql.api.insert('users', {
  id: 1,
  username: "siaeyy",
})}`

const query = await mysql.api
  .exec`SELECT ${mysql.api.columns()} FROM ${mysql.api.table('users')} WHERE ${mysql.api.and(
  [
    {
      username: 'siaeyy',
    },
  ]
)}`

logger.info(query)

await mysql.api.$client.end()
await redis.api.$client.disconnect()
