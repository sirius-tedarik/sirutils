import { tagBuilder } from '@sirutils/core'

export const createTag = tagBuilder('@sirutils/nuts#cbor')

export const cborTags = {
  plugin: createTag('plugin'),

  api: createTag('api'),
} as const

export type CborTags = (typeof cborTags)[keyof typeof cborTags]
