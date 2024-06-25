import { ProjectError, Result } from '@sirutils/core'

import { safeToolboxTags } from '../tag'

export const isURL = Result.fromThrowable(
  (url: string) => new URL(url),
  e => ProjectError.create(safeToolboxTags.isURL, `${e}`)
)
