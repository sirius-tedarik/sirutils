import { ProjectError, ResultAsync, unwrap } from '@sirutils/core'

import { safeToolboxTags } from '../tag'

/**
 * fetch will be converted to ProjectError if fetch returns an error
 */
export const fetch = ResultAsync.fromThrowable(
  async (...args: Parameters<typeof global.fetch>) => await global.fetch(...args),
  e => ProjectError.create(safeToolboxTags.fetch, `${e}`)
)

/**
 * fetch will be converted to ProjectError if fetch returns an error
 */
export const fetchJson = ResultAsync.fromThrowable(
  async (...args: Parameters<typeof fetch>) => await unwrap(await fetch(...args)).json(),
  e => ProjectError.create(safeToolboxTags.fetchJson, `${e}`)
)
