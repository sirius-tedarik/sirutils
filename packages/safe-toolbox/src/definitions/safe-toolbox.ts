import type { SafeToolboxTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      safeToolbox: SafeToolboxTags
    }
  }
}
