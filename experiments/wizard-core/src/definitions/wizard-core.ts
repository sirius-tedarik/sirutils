import type { ExperimentCoreTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      experimentCore: ExperimentCoreTags
    }
  }
}
