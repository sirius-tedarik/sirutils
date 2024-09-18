import { createRedisDriver } from '@sirutils/driver-redis'

import { createMysqlDriver } from '../src'
import { ENV } from './consts'

export const redis = await createRedisDriver({
  client: {
    url: `redis://${ENV.host}:${ENV.port}/${ENV.database}`,
  },
})

export const mysql = await createMysqlDriver(
  {
    pool: {
      host: ENV.mysqlHost,
      user: ENV.mysqlUsername,
      password: ENV.mysqlPassword,
      database: ENV.mysqlDatabase,
    },
  },
  redis
)
