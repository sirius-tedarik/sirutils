import type { NutsTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      nuts: NutsTags
    }

    interface PluginDefinitions {}
  }
}
