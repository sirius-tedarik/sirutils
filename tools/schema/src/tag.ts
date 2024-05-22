import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/schema')

export const schemaTags = {
  traverse: createTag('traverse'),

  readdir: createTag('readdir'),
  readJsonFile: createTag('readJsonFile'),
  isURL: createTag('isURL'),
  fetch: createTag('fetch'),
  getFileChecksum: createTag('getFileChecksum'),
  fileExists: createTag('fileExists'),

  normalize: createTag('normalize'),
  populateImportMaps: createTag('populateImportMaps'),

  generateDefinition: createTag('generateDefinition'),
  generateInterface: createTag('generateInterface'),
  generateRootImports: createTag('generateRootImports'),
} as const

export type SchemaTags = (typeof schemaTags)[keyof typeof schemaTags]
