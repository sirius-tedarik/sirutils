import type { SchemaTags } from '../tag'

declare global {
  // biome-ignore lint/style/noNamespace: Redundant
  namespace Sirutils {
    interface CustomErrors {
      schema: SchemaTags
    }

    // biome-ignore lint/style/noNamespace: Redundant
    namespace Schema {}
  }
}
