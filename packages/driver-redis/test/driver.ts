import { extractEnvs } from '@sirutils/core'
import { createRedisDriver } from '../src/utils/plugin'
import { logger } from '../src/internal/logger'

export const ENV = extractEnvs<Sirutils.DriverRedis.Env>(env => ({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  username: env.REDIS_USERNAME,
  database: env.REDIS_DATABASE || '0',
}))

const redis = await createRedisDriver({
  client: {
    url: `redis://${ENV.host}:${ENV.port}/${ENV.database}`,
  },
})

const data = await redis.api.get('alice')

logger.info(data[0])
