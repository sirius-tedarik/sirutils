import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/seql')

export const seqlTags = {
  logger: createTag('logger'),
  createAdapter: createTag('create-adapter'),
} as const

export type SeqlTags = (typeof seqlTags)[keyof typeof seqlTags]
