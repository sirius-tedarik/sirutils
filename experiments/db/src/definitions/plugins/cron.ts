import type { cronPlugin } from '../../plugins/cron/plugin'

declare global {
  namespace Sirutils {
    namespace Plugins {
      interface Definitions {
        cron: Sirutils.PluginSystem.ExtractDefinition<typeof cronPlugin>
      }

      interface SystemApi {
        cron: Sirutils.Plugins.Definitions['cron']['api']
      }
    }
  }
}
