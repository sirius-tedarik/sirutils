import pkg from '../../package.json'

import { createPlugin, getCircularReplacer, group } from '@sirutils/core'
//import { isRawObject, safeEjsonParse, safeEjsonStringify, traverse } from '@sirutils/safe-toolbox'
import { createAdapter } from '@sirutils/seql'
import { createPool } from 'mysql2/promise'

import { logger } from '../internal/logger'
import { driverMysqlTags } from '../tag'
import { driverActions } from './driver'
import { migrationActions } from './migration'

export const createMysqlDriver = createPlugin<
  Sirutils.DriverMysql.Options,
  Sirutils.DriverMysql.BaseApi
>(
  {
    name: pkg.name,
    version: pkg.version,
    dependencies: {
      'driver-redis': '^0.1.1',
    },
  },
  async context => {
    const checkRedisDriver = group(() => context.lookup('driver-redis'))

    if (checkRedisDriver.isErr()) {
      logger.error(checkRedisDriver)
      checkRedisDriver.error.throw()
    }

    const $client = await createPool(context.options.pool)

    const adapter = await createAdapter(
      async () => ({
        andGrouping: false,
        handleJson: data => JSON.stringify(data, getCircularReplacer),
        handleRaw: data => data.toString(),
        parameterPattern: () => '?',
        transformData: <T>(data: T) => {
          // if (isRawObject(data)) {
          //   const ejsonStr = safeEjsonStringify(data)

          //   // Transform raw object to string if it can be
          //   if (ejsonStr.isOk()) {
          //     return ejsonStr.value as T
          //   }
          // }
          return data
        },
        transformResponse: <T>(data: T) => {
          // // biome-ignore lint/complexity/noForEach: <explanation>
          // traverse(data).forEach(function (value) {
          //   if (value instanceof types.Integer) {
          //     this.update(+value)
          //   } else if (typeof value === 'string') {
          //     // If field value's type is string and it's format is matched with ejson,
          //     // transform to object
          //     const ejsonData = safeEjsonParse(value)

          //     if (ejsonData.isOk()) {
          //       this.update(ejsonData.value)
          //     }
          //   } else if (value instanceof types.Uuid) {
          //     this.update(value.toString())
          //   }
          // })
          return data
        },
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
