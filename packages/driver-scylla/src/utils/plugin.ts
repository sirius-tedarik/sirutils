import pkg from '../../package.json'

import { createPlugin, getCircularReplacer } from '@sirutils/core'
import { createAdapter } from '@sirutils/seql'
import { Client } from 'cassandra-driver'

import { driverScyllaTags } from '../tag'
import { driverActions } from './driver'

export const createScyllaDriver = createPlugin<
  Sirutils.DriverScylla.Options,
  Sirutils.DriverScylla.BaseApi
>(
  {
    name: pkg.name,
    version: pkg.version,
  },
  async context => {
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

    return {
      $client,
      ...adapter,
    }
  },
  driverScyllaTags.plugin
).register(driverActions)
