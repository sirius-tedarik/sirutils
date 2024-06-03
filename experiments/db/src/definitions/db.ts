import type { CronTags } from '../tag'
import type { cronPlugin } from '../plugins/cron/plugin'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      cron: CronTags
    }

    namespace Plugins {
      interface SystemApi {
        cron: Sirutils.PluginSystem.ExtractPlugin<typeof cronPlugin>
      }
    }
  }
}
