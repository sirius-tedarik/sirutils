import { capsule } from '../../result/error'
import { pluginSystemTags } from '../../tag'

/**
 * Adds a plugin to the dependencies
 */
export const createUse: Sirutils.PluginSystem.MakeApi<'use'> = context => {
  return capsule(
    plugin => {
      if (!context.$boundPlugins.includes(plugin)) {
        context.$boundPlugins.push(plugin)
      }

      return true
    },
    pluginSystemTags.use,
    context.$cause
  )
}
