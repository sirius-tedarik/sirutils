import pkg from '../../package.json'

import { createPlugin, group } from '@sirutils/core'
import { traverse } from '@sirutils/safe-toolbox'
import { createAdapter } from '@sirutils/seql'
import { Client, types } from 'cassandra-driver'

import { logger } from '../internal/logger'
import { driverScyllaTags } from '../tag'
import { driverActions } from './internal/driver'
import { migrationActions } from './internal/migration'

export const createScyllaDriver = createPlugin<
  Sirutils.DriverScylla.Options,
  Sirutils.DriverScylla.BaseApi
>(
  {
    name: pkg.name,
    version: pkg.version,
    dependencies: {
      'driver-redis': '^0.2.3',
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
        handleRaw: data => data.toString(),
        parameterPattern: () => '?',
        transformData: <T>(data: T) => data,
        transformResponse: <T>(data: T) => {
          // biome-ignore lint/complexity/noForEach: <explanation>
          traverse(data).forEach(function (value) {
            if (value instanceof types.Integer) {
              this.update(+value)
            } else if (value instanceof types.Uuid) {
              this.update(value.toString())
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
