import pkg from '../../package.json'

import { createPlugin, getCircularReplacer, group } from '@sirutils/core'
import { isRawObject, traverse, ejson } from '@sirutils/safe-toolbox'
import { createAdapter } from '@sirutils/seql'
import { Client, types } from 'cassandra-driver'

import { logger } from '../internal/logger'
import { driverScyllaTags } from '../tag'
import { driverActions } from './driver'
import { migrationActions } from './migration'

export const createScyllaDriver = createPlugin<
  Sirutils.DriverScylla.Options,
  Sirutils.DriverScylla.BaseApi
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

    const $client = new Client(context.options.client)
    await $client.connect()

    const adapter = await createAdapter(
      async () => ({
        andGrouping: false,
        handleJson: data => JSON.stringify(data, getCircularReplacer),
        handleRaw: data => data.toString(),
        parameterPattern: () => '?',
        transformData: <T>(data: T) => {
          if (isRawObject(data)) {
            return ejson.stringify(data) as T
          }
          return data
        },
        transformResponse: <T>(data: T) => {
          // biome-ignore lint/complexity/noForEach: <explanation>
          traverse(data).forEach(function (value) {
            if (value instanceof types.Integer) {
              this.update(+value)
            }else if (typeof value === "string") {
              try {
                return ejson.parse(value)
              } catch (_err) {
                return value
              }
            }
          })
          return data
        },
      }),
      driverScyllaTags.driver
    )

    logger.info('connected to scylla')

    return {
      $client,
      ...adapter,
    }
  },
  driverScyllaTags.plugin
)
  .register(driverActions)
  .register(migrationActions)
  .lock()
