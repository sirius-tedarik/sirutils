import { ProjectError, Result } from '@sirutils/core'

import { safeToolboxTags } from '../tag'

/**
 * Converts a string to a URL, otherwise returns an error
 */
export const isURL = Result.fromThrowable(
  (url: string) => new URL(url),
  e => ProjectError.create(safeToolboxTags.isURL, `${e}`)
)
