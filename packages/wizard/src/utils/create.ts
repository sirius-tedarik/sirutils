import pkg from '../../package.json'

import { type BlobType, ProjectError, capsule, createPlugin, group } from '@sirutils/core'
import { type Context, ServiceBroker } from 'moleculer'

import { logger } from '../internal/logger'
import { wizardTags } from '../tag'
import { WizardRegenerator } from './error'
import { WizardLogger } from './logger'
import { Mixins } from './mixins'

export const createWizard = createPlugin<Sirutils.Wizard.Options, Sirutils.Wizard.BaseApi>(
  {
    name: pkg.name,
    version: pkg.version,
    dependencies: {
      'driver-scylla': '^0.1.1',
      'driver-redis': '^0.1.1',
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
      errorHandler: (e, info) => {
        if ('action' in info) {
          if (e instanceof ProjectError) {
            return e.throw()
          }

          return ProjectError.create(
            wizardTags.unexpected,
            'unexpected error in broker.errorHandler',
            context.$cause
          ).throw()
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
      service: async data => {
        const actions = data.actions
          ? Object.fromEntries(
              Object.entries(data.actions).map(([key, fn]) => {
                return [
                  key,
                  capsule(async (ctx: Context) => {
                    return await fn.apply(null, ctx.params as BlobType[])
                  }, `${wizardTags.service}#${data.name}@${data.version}` as Sirutils.ErrorValues),
                ]
              })
            )
          : {}
        
        // Find out which mixins are used by settings
        const usedMixinNames = data.settings ? Object.keys(data.settings) : []
        
        // Create mixin instances by context and service data
        const mixins = Object.entries(Mixins)
          .map(([name, mixin]) => {
            if (usedMixinNames.includes(name)) {
              const mixinIntance = mixin(context, data)
              if (mixinIntance.isOk()) {
                return mixinIntance.value
              }
            }
          })
          .filter(val => !!val)

        const $service = broker.createService({
          name: data.name,
          version: data.version,
          mixins,
          actions,
        })

        await $service.waitForServices([
          {
            name: data.name,
            version: data.version,
          },
        ])

        return { $service }
      },

      call: capsule(async (target, params) => {
        const name = target.slice(0, target.indexOf('@'))
        const version = target.slice(target.indexOf('@') + 1, target.indexOf('#'))
        const method = target.slice(target.indexOf('#') + 1)

        return (await context.api.broker.call(`${version}.${name}.${method}`, params)) as BlobType
      }, wizardTags.call),
    }
  },
  wizardTags.plugin
)
