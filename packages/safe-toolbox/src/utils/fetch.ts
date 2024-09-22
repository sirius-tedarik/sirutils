import { ProjectError, ResultAsync, unwrap } from '@sirutils/core'

import { safeToolboxTags } from '../tag'

/**
 * fetch will be converted to ProjectError if fetch returns an error
 */
export const safeFetch = ResultAsync.fromThrowable(
  async (...args: Parameters<typeof fetch>) => await fetch(...args),
  e => ProjectError.create(safeToolboxTags.fetch, `${e}`)
)

/**
 * fetch will be converted to ProjectError if fetch returns an error
 */
export const safeFetchJson = ResultAsync.fromThrowable(
  async (...args: Parameters<typeof safeFetch>) => await unwrap(await safeFetch(...args)).json(),
  e => ProjectError.create(safeToolboxTags.safeFetchJson, `${e}`)
)
