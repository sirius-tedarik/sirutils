import { ProjectError, Result } from '@sirutils/core'

import { safeToolboxTags } from '../tag'

export const safeJsonParse = Result.fromThrowable(JSON.parse, e =>
  ProjectError.create(safeToolboxTags.safeJsonParse, `${e}`)
)

export const safeJsonStringify = Result.fromThrowable(JSON.stringify, e =>
  ProjectError.create(safeToolboxTags.safeJsonStringify, `${e}`)
)
