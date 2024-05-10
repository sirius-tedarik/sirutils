import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/seql')

export const seqlTags = {
  env: createTag('invalid-env'),
} as const

export type SeqlTags = (typeof seqlTags)[keyof typeof seqlTags]
