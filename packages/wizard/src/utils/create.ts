import pkg from '../../package.json'

import { type BlobType, ProjectError, createPlugin, group } from '@sirutils/core'
import { ServiceBroker } from 'moleculer'
import ApiGatewayService from 'moleculer-web'

import { logger } from '../internal/logger'
import { wizardTags } from '../tag'
import { actionActions } from './internals/action'
import { WizardRegenerator } from './internals/error'
import { WizardLogger } from './internals/logger'
import { serviceActions } from './internals/service'

export const createWizard = createPlugin<Sirutils.Wizard.Options, Sirutils.Wizard.BaseApi>(
  {
    name: pkg.name,
    version: pkg.version,
    dependencies: {
      'driver-scylla': '^0.1.8',
      'driver-redis': '^0.1.8',
    },
  },
  async context => {
    if (!context.options.nats) {
      context.options.nats = 'nats://localhost:4222'
    }

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
      transporter: context.options.nats,
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
          prefix: 'wiz',
          // set Time-to-live to 30sec.
          ttl: 30,
          // Turns Redis client monitoring on.
          monitor: false,
          // Redis settings
          redis: redis.options.client,
        },
      },
      errorHandler: (e, info) => {
        if ('action' in info) {
          if (e instanceof ProjectError) {
            return e.throw()
          }

          if ((e as BlobType)?.type === 'SERVICE_NOT_FOUND') {
            return ProjectError.create(
              wizardTags.notFound,
              `${(e as BlobType).data.action} not found`,
              context.$cause
            )
              .appendData(e)
              .throw()
          }

          return ProjectError.create(
            wizardTags.unexpected,
            'unexpected error in broker.errorHandler',
            context.$cause
          )
            .appendData(e)
            .throw()
        }

        let result: string = e as BlobType

        if (e instanceof ProjectError) {
          result = e.stringify()
        }

        logger.error(result, info)
      },

      errorRegenerator: new WizardRegenerator(),
    })

    await broker.start()

    return {
      broker,
      gateway: broker.createService({
        name: undefined as BlobType,
        mixins: [ApiGatewayService],
        settings: {
          port: context.options.port,
          ip: context.options.host,
          routes: [
            {
              path: '/',
              mergeParams: false,
              whitelist: ['*'],
            },
          ],

          onError(_req: BlobType, res: BlobType, err: BlobType) {
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(500)
            if (err instanceof ProjectError) {
              res.end(err.stringify())
            } else {
              res.end(String(err))
            }
          },
        },
      }),
      methods: {
        reformatError(err: BlobType) {
          return err
        },
      },
    }
  },
  wizardTags.plugin
)
  .register(serviceActions)
  .register(actionActions)
  .lock()
