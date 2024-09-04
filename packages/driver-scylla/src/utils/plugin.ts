import pkg from '../../package.json'

import { createPlugin, getCircularReplacer, group } from '@sirutils/core'
import { createAdapter } from '@sirutils/seql'
import { Client } from 'cassandra-driver'

import { logger } from '../internal/logger'
import { driverScyllaTags } from '../tag'
import { driverActions } from './driver'

export const createScyllaDriver = createPlugin<
  Sirutils.DriverScylla.Options,
  Sirutils.DriverScylla.BaseApi
>(
  {
    name: pkg.name,
    version: pkg.version,
    dependencies: {
      'driver-redis': '^0.1.0',
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
        handleJson: data => JSON.stringify(data, getCircularReplacer),
        handleRaw: data => data.toString(),
        parameterPattern: () => '?',
        transformData: data => data,
        transformResponse: data => data,
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
  .lock()
