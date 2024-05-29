import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/schema')

export const schemaTags = {
  // internal
  traverse: createTag('traverse'),
  normalize: createTag('normalize'),
  populateImportMaps: createTag('populateImportMaps'),

  generateJSONSchema: createTag('generateJSONSchema'),
  invalidFieldType: createTag('invalidFieldType'),

  // generator
  generateDefinition: createTag('generateDefinition'),
  generateInterface: createTag('generateInterface'),
  generateRootImports: createTag('generateRootImports'),
  generateFields: createTag('generateFields'),
  updateChecksum: createTag('updateChecksum'),

  // other
  fileNotFound: createTag('fileNotFound'),
  cycleDetected: createTag('cycleDetected'),
  invalidData: createTag('invalidData'),
} as const

export type SchemaTags = (typeof schemaTags)[keyof typeof schemaTags]
