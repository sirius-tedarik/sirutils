import { extractEnvs } from '@sirutils/core'

export const ENV = extractEnvs<Sirutils.DriverScylla.Env & Sirutils.DriverRedis.Env>(env => ({
  scyllaContactPoints: env.SCYLLA_CONTACT_POINTS?.split(','),
  scyllaLocalDataCenter: env.SCYLLA_LOCAL_DATA_CENTER,
  scyllaPassword: env.SCYLLA_PASSWORD,
  scyllaUsername: env.SCYLLA_USERNAME,

  redisHost: env.REDIS_HOST,
  redisPort: env.REDIS_PORT,
  redisPassword: env.REDIS_PASSWORD,
  redisUsername: env.REDIS_USERNAME,
  redisDatabase: env.REDIS_DATABASE || '0',
}))
