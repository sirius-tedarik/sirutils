import { createTag } from './internal/tag'

export const coreTags = {
  env: createTag('invalid-env'),
  lazy: createTag('lazy-unexpected'),

  group: createTag('group-missused'),
  groupAsync: createTag('group-async-missused'),

  wrap: createTag('wrap-missused'),
  wrapAsync: createTag('wrap-async-missused'),
} as const

export type CoreTags = (typeof coreTags)[keyof typeof coreTags]
