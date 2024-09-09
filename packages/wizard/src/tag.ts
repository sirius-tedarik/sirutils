import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/wizard')

export const wizardTags = {
  // internal
  logger: createTag('logger'),

  plugin: createTag('plugin'),
} as const

export type WizardTags = (typeof wizardTags)[keyof typeof wizardTags]
