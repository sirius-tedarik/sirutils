import { tagBuilder } from '@sirutils/core'
import { safeToolboxTags } from '@sirutils/safe-toolbox'

const createTag = tagBuilder('@sirutils/toolbox')

export const toolboxTags = {
  // utils/dir
  readdir: createTag('readdir'),

  // utils/file
  readJsonFile: createTag('read-json-file'),
  fileExists: createTag('file-exists'),
  writeFile: createTag('write-file'),

  // utils/crypto
  getChecksum: createTag('get-checksum'),
  getFileChecksum: createTag('get-file-checksum'),

  ...safeToolboxTags,
} as const

export type ToolboxTags = (typeof toolboxTags)[keyof typeof toolboxTags]
