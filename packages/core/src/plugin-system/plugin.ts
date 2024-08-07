import type { Spreadable } from 'type-fest/source/spread'

import { logger } from '../internal/logger'
import { capsule } from '../result/error'
import { pluginSystemTags } from '../tag'
import type { BlobType } from '../utils/common'
import { createContext } from './context'

export const createPlugin = capsule(
  <const O, const R extends Spreadable>(
    meta: Sirutils.PluginSystem.Meta,
    pluginInitiator: (context: Sirutils.PluginSystem.Context<O, R>) => Promise<R> | R,
    cause: Sirutils.ErrorValues,
    defaultOptions?: O
  ): Sirutils.PluginSystem.Plugin<O, R> => {
    const apis: Sirutils.PluginSystem.Action[] = []

    const plugin = (async (rawOptions?: O) => {
      const $id = `${meta.name}@${meta.version}-${(Math.random() + 1).toString(36).substring(2)}`

      const pluginContext = createContext(
        (context: Sirutils.PluginSystem.Definition<O, R>, options?: O) => {
          if (options && !Object.hasOwn(context, 'options')) {
            context.options = options
          }
        },
        cause,
        {
          meta,

          $id,
          $cause: cause,
          $boundApps: [],
        } as BlobType
      )

      const options: O | undefined = rawOptions
        ? { ...(defaultOptions ?? {}), ...rawOptions }
        : undefined

      pluginContext.init(options)
      pluginContext.api = Object.assign(
        {},
        await pluginInitiator(pluginContext),
        ...(await Promise.all(apis.map(actionInitiator => actionInitiator(pluginContext, cause))))
      )

      return pluginContext
    }) as unknown as Sirutils.PluginSystem.Plugin<O, R>

    plugin.register = actionInitiator => {
      if (apis.includes(actionInitiator)) {
        logger.warn('actionInitiator registered some actions twice')
      } else {
        apis.push(actionInitiator)
      }

      return plugin as BlobType
    }

    return plugin
  },
  pluginSystemTags.create
)
