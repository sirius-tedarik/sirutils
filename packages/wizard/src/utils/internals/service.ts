import { type BlobType, createActions, group, unwrap } from '@sirutils/core'
import { isArray, isRawObject, safeJsonStringify } from '@sirutils/toolbox'
import type { GatewayResponse, IncomingRequest } from 'moleculer-web'

import { wizardTags } from '../../tag'
import { toMethod } from '../toMethod'
import { createServiceLogger } from './logger'

export const serviceActions = createActions(
  (context: Sirutils.Wizard.Context): Sirutils.Wizard.ServiceApi => {
    return {
      service: async serviceOptions => {
        const aliases: Record<string, BlobType> = {}

        serviceOptions.actions = Object.fromEntries(
          Object.entries(serviceOptions.actions ?? {}).map(([key, value]) => [
            key,
            (value as BlobType)(serviceOptions),
          ])
        ) as BlobType

        for (const [key, value] of Object.entries(serviceOptions.actions ?? {})) {
          if (value.rest) {
            aliases[
              typeof value.rest === 'boolean' ? `${toMethod(key)} /` : (value.rest as string)
            ] = async (req: IncomingRequest, res: GatewayResponse) => {
              const result = await group(() =>
                // biome-ignore lint/style/noNonNullAssertion: Redundant
                serviceOptions.actions![key]?.handler!(req.$ctx)
              )

              if (result.isOk() && typeof result.value !== 'undefined') {
                if (isRawObject(result.value) || isArray(result.value)) {
                  res.setHeader('Content-Type', 'application/json')
                  res.end(unwrap(safeJsonStringify(result.value)))
                } else {
                  res.end(result.value)
                }
              }

              if (result.isErr()) {
                res.setHeader('Content-Type', 'application/json')
                res.end(result.error.stringify())
              }
            }
          }
        }

        const $service = context.api.broker.createService({
          name: serviceOptions.name,
          version: serviceOptions.version,
          actions: serviceOptions.actions ?? {},
          created(this: BlobType) {
            //Overwrite logger with service logger if there is
            if (this.logger) {
              this.logger = createServiceLogger(serviceOptions.name)
            }
          },
        })

        await $service.waitForServices([
          {
            name: serviceOptions.name,
            version: serviceOptions.version,
          },
        ])

        await group(() =>
          context.api.gateway.removeRoute(`${serviceOptions.name}/${serviceOptions.version}`)
        )

        await context.api.gateway.addRoute({
          path: `${serviceOptions.name}/${serviceOptions.version}`,
          aliases,
          mergeParams: false,
        })

        return { $service }
      },

      call: async (target, params) => {
        const name = target.slice(0, target.indexOf('@'))
        const version = target.slice(target.indexOf('@') + 1, target.indexOf('#'))
        const method = target.slice(target.indexOf('#') + 1)

        return (await context.api.broker.call(`${version}.${name}.${method}`, params)) as BlobType
      },
    }
  },
  wizardTags.service
)
