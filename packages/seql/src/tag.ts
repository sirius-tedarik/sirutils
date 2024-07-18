import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/seql')

export const seqlTags = {
  logger: createTag('logger'),
  env: createTag('invalid-env'),

  // errors
  cacheEvicted: createTag('cache-evicted'),
  tableNotDefined: createTag('table-not-defined'),
} as const

export type SeqlTags = (typeof seqlTags)[keyof typeof seqlTags]
