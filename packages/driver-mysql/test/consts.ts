import { extractEnvs } from '@sirutils/core'

export const ENV = extractEnvs<Sirutils.DriverMysql.Env & Sirutils.DriverRedis.Env>(env => ({
  mysqlHost: env.MYSQL_HOST,
  mysqlUsername: env.MYSQL_USERNAME,
  mysqlPassword: env.MYSQL_PASSWORD,
  mysqlDatabase: env.SMYSQL_DATABASE,

  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  username: env.REDIS_USERNAME,
  database: env.REDIS_DATABASE || '0',
}))
