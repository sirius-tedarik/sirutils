import { type BlobType, capsule, createActions } from '@sirutils/core'
import type { Context } from 'moleculer'
import { wizardTags } from '../../tag'

export const serviceActions = createActions(
  (context: Sirutils.Wizard.Context): Sirutils.Wizard.ServiceApi => {
    return {
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

        const $service = context.api.broker.createService({
          name: data.name,
          version: data.version,
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
