import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/safe-toolbox')

export const safeToolboxTags = {
  // utils/fetch
  fetch: createTag('fetch'),
  safeFetchJson: createTag('safe-fetch-json'),

  // utils/other
  toUrl: createTag('to-url'),

  // utils/object-like
  extractKeys: createTag('extract-keys'),
  emptyList: createTag('empty-list'),
  differentKeys: createTag('different-keys'),
} as const

export type SafeToolboxTags = (typeof safeToolboxTags)[keyof typeof safeToolboxTags]
