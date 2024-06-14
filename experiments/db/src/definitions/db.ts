import type { CronTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      cron: CronTags
    }
  }
}
