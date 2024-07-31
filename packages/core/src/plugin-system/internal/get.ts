import { semver } from 'bun'

import { ProjectError, forward } from '../../result/error'
import { pluginSystemTags } from '../../tag'
import type { BlobType } from '../../utils/common'

export const createGet: Sirutils.PluginSystem.MakeBaseApi<'get'> = appContext => {
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

        return result as BlobType
      },
      pluginSystemTags.appGet,
      appContext.$cause
    )
}
