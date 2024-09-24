import { type BlobType, createActions, group, unwrap } from '@sirutils/core'
import { isArray, isRawObject, safeJsonStringify } from '@sirutils/toolbox'
import type { GatewayResponse, IncomingRequest } from 'moleculer-web'

import { wizardTags } from '../../tag'
import { toMethod } from '../toMethod'

export const serviceActions = createActions(
  (context: Sirutils.Wizard.Context): Sirutils.Wizard.ServiceApi => {
    return {
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Redundant
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
            const handler = async (req: IncomingRequest, res: GatewayResponse) => {
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
                res.statusCode = 500
                res.end(result.error.stringify())
              }
            }

            if (typeof value.rest === 'boolean') {
              aliases[`${toMethod(key)} /`] = handler
            } else if (value.rest && Array.isArray(value.rest)) {
              for (const rest of value.rest) {
                aliases[rest as string] = handler
              }
            } else if (value.rest) {
              aliases[value.rest as string] = handler
            }
          }
        }

        const $service = context.api.broker.createService({
          name: serviceOptions.name,
          version: serviceOptions.version,
          actions: serviceOptions.actions ?? {},
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

      call: async (target, params, options) => {
        const name = target.slice(0, target.indexOf('@'))
        const version = target.slice(target.indexOf('@') + 1, target.indexOf('#'))
        const method = target.slice(target.indexOf('#') + 1)

        if (options?.stream) {
          return (await context.api.broker.call(`${version}.${name}.${method}`, options.stream, {
            ...options,
            meta: {
              ...options.meta,
              ...params,
            },
          })) as BlobType
        }

        return (await context.api.broker.call(
          `${version}.${name}.${method}`,
          params,
          options
        )) as BlobType
      },
    }
  },
  wizardTags.service
)
