import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/wizard')

export const wizardTags = {
  // internal
  logger: createTag('logger'),
  unexpected: createTag('unexpected'),

  plugin: createTag('plugin'),
  service: createTag('service'),
  action: createTag('action'),
  httpMixin: createTag('http-mixin'),

  invalidBody: createTag('invalid-body'),
  invalidParams: createTag('invalid-params'),
  invalidQueries: createTag('invalid-queries'),
} as const

export type WizardTags = (typeof wizardTags)[keyof typeof wizardTags]
