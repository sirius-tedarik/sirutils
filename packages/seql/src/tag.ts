import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/seql')

export const seqlTags = {
  logger: createTag('logger'),
  env: createTag('invalid-env'),
  cacheEvicted: createTag('cache-evicted'),
} as const

export type SeqlTags = (typeof seqlTags)[keyof typeof seqlTags]
