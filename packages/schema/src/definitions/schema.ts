import type { SchemaTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      schema: SchemaTags
    }

    /**
     * Add the env definitions
     */
    interface Env {}

    namespace Schema {}
  }
}
