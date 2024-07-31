import { ProjectError, forward } from '../../result/error'
import { pluginSystemTags } from '../../tag'

export const createLookupByOption: Sirutils.PluginSystem.MakeBaseApi<
  'lookupByOption'
> = appContext => {
  return (name, key, value) =>
    forward(
      () => {
        const result = appContext.$plugins.find(
          plugin => plugin.meta.name === name && plugin.options[key] === value
        )

        if (!result) {
          ProjectError.create(
            pluginSystemTags.pluginNotFound,
            `${name}@* ${key}:${value} not found`
          ).throw()
        }

        return result?.api
      },
      pluginSystemTags.appLookupByOption,
      appContext.$cause
    )
}
