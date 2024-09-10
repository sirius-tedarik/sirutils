import pkg from '../../package.json'

import { type BlobType, ProjectError, createPlugin, group } from '@sirutils/core'
import { ServiceBroker } from 'moleculer'

import { logger } from '../internal/logger'
import { wizardTags } from '../tag'
import { WizardLogger } from './logger'

export const createWizard = createPlugin<Sirutils.Wizard.Options, Sirutils.Wizard.BaseApi>(
  {
    name: pkg.name,
    version: pkg.version,
    dependencies: {
      'driver-scylla': '^0.1.0',
      'driver-redis': '^0.1.0',
    },
  },
  async context => {
    const checkDrivers = group(() => [
      context.lookup('driver-redis'),
      context.lookup('driver-scylla'),
    ])

    if (checkDrivers.isErr()) {
      checkDrivers.error.throw()
    }

    const redis = context.get('driver-redis')

    const broker = new ServiceBroker({
      namespace: context.options.environment || null,
      nodeID: context.options.id || null,

      logger: new WizardLogger(),
      transporter: 'nats://localhost:4222',
      serializer: 'CBOR',

      contextParamsCloning: false,
      maxCallLevel: 100,
      heartbeatInterval: 5,
      heartbeatTimeout: 15,
      disableBalancer: false,
      circuitBreaker: {
        enabled: true,
      },
      bulkhead: {
        enabled: true,
        concurrency: 10,
        maxQueueSize: 100,
      },
      cacher: {
        type: 'Redis',
        options: {
          // Prefix for keys
          prefix: 'mol',
          // set Time-to-live to 30sec.
          ttl: 30,
          // Turns Redis client monitoring on.
          monitor: false,
          // Redis settings
          redis: redis.options.client,
        },
      },
      errorHandler: e => {
        let result: string = e as BlobType

        if (e instanceof ProjectError) {
          result = e.stringify()
        }

        logger.error(result)
      },
    })

    return {
      broker,
      service: () => ({}),
    }
  },
  wizardTags.plugin
)
