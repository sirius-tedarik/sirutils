import { semver } from 'bun'

import { ProjectError, capsule } from '../../result/error'
import { pluginSystemTags } from '../../tag'
import type { BlobType } from '../../utils/common'

export const createGet: Sirutils.PluginSystem.MakeApi<'get'> = context => {
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

      return result as BlobType
    },
    pluginSystemTags.get,
    context.$cause
  )
}
