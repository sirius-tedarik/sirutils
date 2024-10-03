import { type BlobType, createActions, forward, group, unwrap } from '@sirutils/core'
import { isArray, isRawObject, isStream, safeJsonStringify } from '@sirutils/toolbox'
import type { GatewayResponse, IncomingRequest } from 'moleculer-web'

import { logger } from '../../internal/logger'
import { createTag } from '../../internal/tag'
import { wizardTags } from '../../tag'
import { toMethod } from './toMethod'

export const serviceActions = createActions(
  (context: Sirutils.Wizard.Context): Sirutils.Wizard.ServiceApi => {
    return {
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Redundant
      service: async serviceOptions => {
        const aliases: Record<string, BlobType> = {}

        serviceOptions.actions = Object.fromEntries(
          Object.entries(serviceOptions.actions ?? {}).map(([key, value]) => [
            key,
            (value as BlobType)(serviceOptions, key),
          ])
        ) as BlobType

        for (const [key, value] of Object.entries(serviceOptions.actions ?? {})) {
          if (value.rest) {
            // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
            const handler = async (req: IncomingRequest, res: GatewayResponse) => {
              const result = await group(() =>
                // biome-ignore lint/style/noNonNullAssertion: Redundant
                serviceOptions.actions![key]?.handler!(req.$ctx)
              )

              if (result.isOk() && typeof result.value !== 'undefined') {
                if (isStream(result.value)) {
                  if ((req.$ctx.meta as BlobType)?.$responseType) {
                    res.setHeader('Content-Type', (req.$ctx.meta as BlobType).$responseType)
                  }

                  if (isRawObject((req.$ctx.meta as BlobType)?.$responseHeaders)) {
                    for (const [key, value] of Object.entries(
                      (req.$ctx.meta as BlobType)?.$responseHeaders
                    )) {
                      res.setHeader(key, value as BlobType)
                    }
                  }

                  return result.value.pipe(res)
                }

                if (isRawObject(result.value) || isArray(result.value)) {
                  res.setHeader('Content-Type', 'application/json')
                  res.end(unwrap(safeJsonStringify(result.value)))
                } else {
                  res.end(String(result.value))
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

        if (serviceOptions.created) {
          const serviceLogger = logger.create({
            defaults: {
              tag: createTag(`${serviceOptions.name}.${serviceOptions.version}.created`),
            },
          })

          await group(() =>
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            serviceOptions.created!({
              body: {},
              logger: serviceLogger,
            } as BlobType)
          )
        }

        return { $service }
      },

      call: async (target, params = {}, options = {}) => {
        const name = target.slice(0, target.indexOf('@'))
        const version = target.slice(target.indexOf('@') + 1, target.indexOf('#'))
        const method = target.slice(target.indexOf('#') + 1)

        return await forward(async () => {
          if (options?.stream) {
            return (await context.api.broker.call(`${version}.${name}.${method}`, options.stream, {
              ...options,
              meta: {
                ...options.meta,
                ...(params as BlobType),
              },
            })) as BlobType
          }

          return (await context.api.broker.call(
            `${version}.${name}.${method}`,
            params,
            options
          )) as BlobType
        }, target as Sirutils.ErrorValues)
      },
    }
  },
  wizardTags.service
)
