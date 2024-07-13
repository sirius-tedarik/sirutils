import { tagBuilder } from '@sirutils/core'

const wizardTag = tagBuilder('@sirutils/wizard')

export const wizardTags = {
  plugin: wizardTag('plugin'),
  logger: wizardTag('logger'),
} as const

export type WizardTags = (typeof wizardTags)[keyof typeof wizardTags]
