import { semver } from 'bun'
import { ProjectError, capsule } from '../../result/error'
import { pluginSystemTags } from '../../tag'

export const createLookup: Sirutils.PluginSystem.MakeApi<'lookup'> = context => {
  return capsule(
    (name, version) => {
      const result = context.$boundPlugins.find(
        plugin => plugin.meta.name === name && semver.satisfies(plugin.meta.version, version || '*')
      )

      if (!result) {
        ProjectError.create(
          pluginSystemTags.notFound,
          `${name}@${version ?? '*'} not found`
        ).throw()
      }

      return result?.api
    },
    pluginSystemTags.lookup,
    context.$cause
  )
}
