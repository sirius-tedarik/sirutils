import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/schema')

export const schemaTags = {
  invalidTypeDate: createTag('invalid-type-date'),
  invalidTypeNumeric: createTag('invalid-type-numeric'),
  invalidTypeBooleanString: createTag('invalid-type-boolean-string'),
  invalidTypeObjectString: createTag('invalid-type-object-string'),
} as const

export type SchemaTags = (typeof schemaTags)[keyof typeof schemaTags]
