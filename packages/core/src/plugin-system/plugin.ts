import type { Spreadable } from 'type-fest/source/spread'

import { logger } from '../internal/logger'
import { ProjectError, capsule, forward } from '../result/error'
import { pluginSystemTags } from '../tag'
import type { BlobType } from '../utils/common'
import { createContext } from './context'
import { createGet } from './internal/get'
import { createLookup } from './internal/lookup'
import { createLookupByOption } from './internal/lookup-by-option'
import { createUse } from './internal/use'

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
    let locked = false
    const apis: Sirutils.PluginSystem.Action[] = []

    meta.name = meta.name.split('@sirutils/').join('')
    const $id = `${meta.name}@${meta.version}-${(Math.random() + 1).toString(36).substring(2)}`

    const plugin = (async (
      rawOptions?: O,
      ...dependencies: Sirutils.PluginSystem.Definition<BlobType, BlobType>[]
    ) => {
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
          $boundPlugins: [],
        } as BlobType
      )

      const options = { ...(defaultOptions ?? {}), ...(rawOptions ?? {}) } as O

      pluginContext.init(options)
      pluginContext.use = createUse(pluginContext)
      pluginContext.get = createGet(pluginContext)
      pluginContext.lookup = createLookup(pluginContext)
      pluginContext.lookupByOption = createLookupByOption(pluginContext)

      for (const dependency of dependencies) {
        pluginContext.use(dependency)
      }

      pluginContext.api = await forward(
        () => pluginInitiator(pluginContext),
        pluginSystemTags.pluginInitiator,
        cause
      )

      for (const actionInitiator of apis) {
        Object.assign(pluginContext.api, await actionInitiator(pluginContext, cause))
      }

      return pluginContext
    }) as unknown as Sirutils.PluginSystem.Plugin<O, R>

    plugin.register = actionInitiator => {
      if (locked) {
        return ProjectError.create(pluginSystemTags.locked, `${$id} is locked`, cause).throw()
      }

      if (apis.includes(actionInitiator)) {
        logger.warn('actionInitiator registered some actions twice')
      } else {
        apis.push(actionInitiator)
      }

      return plugin as BlobType
    }

    plugin.lock = () => {
      if (locked) {
        return ProjectError.create(
          pluginSystemTags.locked,
          `${$id} is already locked`,
          cause
        ).throw()
      }

      locked = true

      return plugin
    }

    return Object.freeze(plugin)
  },
  pluginSystemTags.create
)
