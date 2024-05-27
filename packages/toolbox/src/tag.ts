import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/toolbox')

export const toolboxTags = {
  // utils/dir
  readdir: createTag('readdir'),

  // utils/file
  readJsonFile: createTag('readJsonFile'),
  fileExists: createTag('fileExists'),

  // utils/crypto
  getChecksum: createTag('getChecksum'),
  getFileChecksum: createTag('getFileChecksum'),

  // utils/fetch
  fetch: createTag('fetch'),

  // utils/other
  isURL: createTag('isURL'),
} as const

export type ToolboxTags = (typeof toolboxTags)[keyof typeof toolboxTags]
