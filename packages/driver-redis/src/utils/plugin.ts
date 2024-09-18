import pkg from '../../package.json'

import { type BlobType, createPlugin, ProjectError } from '@sirutils/core'
import { Evt } from '@sirutils/safe-toolbox'
import { Redis } from 'ioredis'

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
  context => {
    const $events = Evt.create<Sirutils.ProjectErrorType>()
    const $client = new Redis(context.options.client)

    $client.on('error', e => {
      const error = ProjectError.create(driverRedisTags.redisGlobal, e.message).appendData(e)

      logger.error(error.stringify())
      $events.post(error)
    })

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
