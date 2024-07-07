import { forwardAsync } from '../../result/error'
import { pluginSystemTags } from '../../tag'

export const createUse: Sirutils.PluginSystem.MakeBaseApi<'use'> = appContext => {
  return pluginInstance =>
    forwardAsync(
      async () => {
        const plugin = await pluginInstance(appContext)

        if (plugin.meta.system && !appContext.$system.includes(plugin)) {
          appContext.$system.push(plugin)
        }

        if (!(plugin.meta.system || appContext.$plugins.includes(plugin))) {
          appContext.$plugins.push(plugin)
        }

        return true
      },
      pluginSystemTags.appUse,
      appContext.$cause
    )
}
