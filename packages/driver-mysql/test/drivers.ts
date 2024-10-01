import { createRedisDriver } from '@sirutils/driver-redis'

import { createMysqlDriver } from '../src'
import { ENV } from './consts'

export const redis = await createRedisDriver({
  client: {
    host: ENV.redisHost,
    port: ENV.redisPort,
    db: ENV.redisDatabase,
    password: ENV.redisPassword,
  },
})

export const mysql = await createMysqlDriver(
  {
    client: {
      host: ENV.mysqlHost,
      port: ENV.mysqlPort,
      user: ENV.mysqlUsername,
      password: ENV.mysqlPassword,
      database: 'sirius',
    },
  },
  redis
)
