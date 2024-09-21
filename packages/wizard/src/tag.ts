import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/wizard')

export const wizardTags = {
  // internal
  logger: createTag('logger'),
  unexpected: createTag('unexpected'),

  plugin: createTag('plugin'),
  service: createTag('service'),
} as const

export type WizardTags = (typeof wizardTags)[keyof typeof wizardTags]
