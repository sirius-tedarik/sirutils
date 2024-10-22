import { tagBuilder } from '@sirutils/core'

export const createTag = tagBuilder('@sirutils/nuts')

export const nutsTags = {
  // internal
  logger: createTag('logger'),

  plugin: createTag('plugin'),
  broker: createTag('broker'),
} as const

export type NutsTags = (typeof nutsTags)[keyof typeof nutsTags]
