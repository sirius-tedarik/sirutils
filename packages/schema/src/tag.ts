import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/schema')

export const schemaTags = {
  createSync: createTag('create-sync'),
  createAsync: createTag('create-async'),
  validator: createTag('validator'),

  invalidData: createTag('invalid-data'),
} as const

export type SchemaTags = (typeof schemaTags)[keyof typeof schemaTags]
