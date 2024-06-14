import type { cronPlugin } from '../../plugins/cron/plugin'

declare global {
  namespace Sirutils {
    namespace Plugins {
      interface SystemApi {
        cron: Sirutils.PluginSystem.ExtractPlugin<typeof cronPlugin>
      }
    }
  }
}
