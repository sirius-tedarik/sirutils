import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/seql')

export const seqlTags = {
  logger: createTag('logger'),
  createAdapter: createTag('create-adapter'),

  cacheTableName: createTag('cache#table-name'),
  cacheEvicted: createTag('cache#evicted'),
  cacheInvalid: createTag('cache#invalid'),
} as const

export type SeqlTags = (typeof seqlTags)[keyof typeof seqlTags]
