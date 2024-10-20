import { createTag } from './internal/tag'

export const nutsTags = {
  // internal
  logger: createTag('logger'),

  plugin: createTag('plugin'),
} as const

export type NutsTags = (typeof nutsTags)[keyof typeof nutsTags]
