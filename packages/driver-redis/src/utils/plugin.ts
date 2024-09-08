import pkg from '../../package.json'

import { type BlobType, ProjectError, createPlugin } from '@sirutils/core'
import { Evt } from '@sirutils/safe-toolbox'
import { createClient } from 'redis'

import { DEFAULT_TTL } from '../internal/consts'
import { logger } from '../internal/logger'
import { driverRedisTags } from '../tag'
import { driverActions } from './internal/driver'

export const createRedisDriver = createPlugin<
  Sirutils.DriverRedis.Options,
  Sirutils.DriverRedis.BaseApi
>(
  {
    name: pkg.name,
    version: pkg.version,
  },
  async context => {
    const $events = Evt.create<Sirutils.ProjectErrorType>()
    const $client = (await createClient(context.options.client)
      .on('error', e => {
        const error = ProjectError.create(driverRedisTags.redisGlobal, e).appendData([e])

        logger.error(error.stringify())
        $events.post(error)
      })
      .connect()) as Sirutils.DriverRedis.BaseApi['$client']

    logger.info('connected to redis')

    return {
      $events,
      $client,
    }
  },
  driverRedisTags.plugin,
  {
    ttl: DEFAULT_TTL,
  } as BlobType
)
  .register(driverActions)
  .lock()
