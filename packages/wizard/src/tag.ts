import { tagBuilder } from '@sirutils/core'

const wizardTag = tagBuilder('@sirutils/wizard')

export const wizardTags = {
  plugin: wizardTag('plugin'),
  logger: wizardTag('logger'),

  baseApi: wizardTag('base-api'),
  serviceApi: wizardTag('service-api'),

  match: wizardTag('match'),

  // errors
  badUrl: wizardTag('bad-url'),
  badData: wizardTag('bad-data'),
  discover: wizardTag('discover'),
  importErrorConfig: wizardTag('import-error-config'),
} as const

export type WizardTags = (typeof wizardTags)[keyof typeof wizardTags]
