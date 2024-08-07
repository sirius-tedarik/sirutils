import { ProjectError, capsule } from '../../result/error'
import { pluginSystemTags } from '../../tag'

export const createLookupByOption: Sirutils.PluginSystem.MakeApi<'lookupByOption'> = context => {
  return capsule(
    (key, value) => {
      const result = context.$boundPlugins.find(plugin => plugin.options[key] === value)

      if (!result) {
        ProjectError.create(pluginSystemTags.notFound, `${key}:${value} not found`).throw()
      }

      return result?.api
    },
    pluginSystemTags.lookupByOption,
    context.$cause
  )
}
