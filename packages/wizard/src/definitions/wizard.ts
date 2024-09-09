import type { WizardTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      wizard: WizardTags
    }
  }
}
