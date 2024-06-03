import { tagBuilder } from '@sirutils/core'

const cronTag = tagBuilder('@sirutils/cron')

export const cronTags = {
  dbExperiment: cronTag('db-experiment'),

  cronPlugin: cronTag('cron-plugin'),
  hi: cronTag('hi'),
} as const

export type CronTags = (typeof cronTags)[keyof typeof cronTags]
