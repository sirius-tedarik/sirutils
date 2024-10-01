import pkg from '../../package.json'

import { createPlugin, group } from '@sirutils/core'
import { createAdapter } from '@sirutils/seql'
import mysql from 'mysql2/promise'

import { logger } from '../internal/logger'
import { driverMysqlTags } from '../tag'
import { driverActions } from './internal/driver'
import { migrationActions } from './internal/migration'

export const createMysqlDriver = createPlugin<
  Sirutils.DriverMysql.Options,
  Sirutils.DriverMysql.BaseApi
>(
  {
    name: pkg.name,
    version: pkg.version,
    dependencies: {
      'driver-redis': '^0.1.7',
    },
  },
  async context => {
    const checkRedisDriver = group(() => context.lookup('driver-redis'))

    if (checkRedisDriver.isErr()) {
      logger.error(checkRedisDriver)
      checkRedisDriver.error.throw()
    }

    const $client = await mysql.createConnection(context.options.client)

    const adapter = await createAdapter(
      async () => ({
        andGrouping: true,
        handleRaw: data => data.toString(),
        parameterPattern: () => '?',
        transformData: <T>(data: T) => data,
        transformResponse: <T>(data: T) => data,
      }),
      driverMysqlTags.driver
    )

    logger.info('connected to mysql')

    return {
      $client,
      ...adapter,
    }
  },
  driverMysqlTags.plugin
)
  .register(driverActions)
  .register(migrationActions)
  .lock()
