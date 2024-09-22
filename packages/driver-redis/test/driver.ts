import { extractEnvs } from '@sirutils/core'
import { logger } from '../src/internal/logger'
import { createRedisDriver } from '../src/utils/plugin'

export const ENV = extractEnvs<Sirutils.DriverRedis.Env>(env => ({
  redisHost: env.REDIS_HOST,
  redisPort: +env.REDIS_PORT,
  redisPassword: env.REDIS_PASSWORD,
  redisUsername: env.REDIS_USERNAME,
  redisDatabase: +env.REDIS_DATABASE || 0,
}))

const redis = await createRedisDriver({
  client: {
    host: ENV.redisHost,
    port: ENV.redisPort,
    db: ENV.redisDatabase,
    password: ENV.redisPassword,
  },
})

const data = await redis.api.get('alice')

logger.info(data[0])
