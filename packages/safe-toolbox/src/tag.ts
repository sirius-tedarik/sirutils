import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/safe-toolbox')

export const safeToolboxTags = {
  // utils/fetch
  fetch: createTag('fetch'),

  // utils/other
  isURL: createTag('is-url'),
} as const

export type SafeToolboxTags = (typeof safeToolboxTags)[keyof typeof safeToolboxTags]
