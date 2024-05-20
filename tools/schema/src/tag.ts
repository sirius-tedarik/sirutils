import { tagBuilder } from '@sirutils/core/dist'

const createTag = tagBuilder('@sirutils/schema')

export const schemaTags = {
  traverse: createTag('traverse'),

  readdir: createTag('readdir'),
  readJsonFile: createTag('readJsonFile'),
  isURL: createTag('isURL'),
  fetch: createTag('fetch'),
  getFileChecksum: createTag('getFileChecksum'),
} as const

export type SchemaTags = (typeof schemaTags)[keyof typeof schemaTags]
