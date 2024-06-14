import { tagBuilder } from '@sirutils/core'

const cronTag = tagBuilder('@sirutils/cron')

export const cronTags = {
  dbExperiment: cronTag('db-experiment'),
  logger: cronTag('logger'),

  cronPlugin: cronTag('cron-plugin'),

  exampleApi: cronTag('example-api'),
} as const

export type CronTags = (typeof cronTags)[keyof typeof cronTags]
