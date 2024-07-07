import { semver } from 'bun'
import { ProjectError, forward } from '../../result/error'
import { pluginSystemTags } from '../../tag'

export const createLookup: Sirutils.PluginSystem.MakeBaseApi<'lookup'> = appContext => {
  return (name, version) =>
    forward(
      () => {
        const result = appContext.$plugins.find(
          plugin =>
            plugin.meta.name === name && semver.satisfies(plugin.meta.version, version || '*')
        )

        if (!result) {
          ProjectError.create(
            pluginSystemTags.pluginNotFound,
            `${name}@${version ?? '*'} not found`
          ).throw()
        }

        return result?.api
      },
      pluginSystemTags.appLookup,
      appContext.$cause
    )
}
