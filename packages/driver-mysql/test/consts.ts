import { extractEnvs } from '@sirutils/core'

export const ENV = extractEnvs<Sirutils.DriverMysql.Env & Sirutils.DriverRedis.Env>(env => ({
  mysqlHost: env.MYSQL_HOST,
  mysqlPort: +env.MYSQL_PORT,
  mysqlPassword: env.MYSQL_PASSWORD,
  mysqlUsername: env.MYSQL_USERNAME,

  redisHost: env.REDIS_HOST,
  redisPort: env.REDIS_PORT,
  redisPassword: env.REDIS_PASSWORD,
  redisUsername: env.REDIS_USERNAME,
  redisDatabase: env.REDIS_DATABASE || '0',
}))
