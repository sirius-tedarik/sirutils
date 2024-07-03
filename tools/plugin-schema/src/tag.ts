import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/plugin-schema')

export const schemaPluginTags = {
  normalize: createTag('normalize'),
  cycleDetected: createTag('cycle-detected'),
  populateImportMaps: createTag('populate-import-maps'),
  invalidFieldType: createTag('invalid-field-type'),
  generateJSONSchema: createTag('generate-json-schema'),
  traverse: createTag('traverse'),
} as const

export type SchemaPluginTags = (typeof schemaPluginTags)[keyof typeof schemaPluginTags]
