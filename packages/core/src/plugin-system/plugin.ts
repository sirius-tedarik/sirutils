import type { Spreadable } from 'type-fest/source/spread'

import { logger } from '../internal/logger'
import { capsule } from '../result/error'
import { pluginSystemTags } from '../tag'
import type { BlobType } from '../utils/common'
import { createContext } from './context'
import { createUse } from './internal/use'
import { createLookupByOption } from './internal/lookup-by-option'
import { createLookup } from './internal/lookup'
import { createGet } from './internal/get'

/**
 * This code defines a createPlugin function that generates a plugin for a system by initializing a context, merging options, and registering actions.
 * The function also handles errors if an action is registered multiple times.
 */
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
      pluginContext.api = await pluginInitiator(pluginContext)

      pluginContext.use = createUse(pluginContext)
      pluginContext.get = createGet(pluginContext)
      pluginContext.lookup = createLookup(pluginContext)
      pluginContext.lookupByOption = createLookupByOption(pluginContext)

      for (const actionInitiator of apis) {
        Object.assign(pluginContext.api, await actionInitiator(pluginContext, cause))
      }

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
