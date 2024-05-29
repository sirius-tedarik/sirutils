import { ProjectError, Result } from '@sirutils/core'

import { toolboxTags } from '../tag'

export const isURL = Result.fromThrowable(
  (url: string) => new URL(url),
  e => ProjectError.create(toolboxTags.isURL, `${e}`)
)
