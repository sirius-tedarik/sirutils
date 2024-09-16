import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/safe-toolbox')

export const safeToolboxTags = {
  // utils/fetch
  fetch: createTag('fetch'),
  safeFetchJson: createTag('safe-fetch-json'),

  // utils/other
  toUrl: createTag('to-url'),
  safeJsonParse: createTag('safe-json-parse'),
  safeJsonStringify: createTag('safe-json-stringify'),
  
  safeEjsonParse: createTag('safe-ejson-parse'),
  safeEjsonStringify: createTag('safe-ejson-stringify'),

  // utils/object-like
  extractKeys: createTag('extract-keys'),
  emptyList: createTag('empty-list'),
  differentKeys: createTag('different-keys'),
} as const

export type SafeToolboxTags = (typeof safeToolboxTags)[keyof typeof safeToolboxTags]
