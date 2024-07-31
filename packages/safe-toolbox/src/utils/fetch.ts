import { ProjectError, ResultAsync } from '@sirutils/core'

import { safeToolboxTags } from '../tag'

export const fetchJson = ResultAsync.fromThrowable(
  async (...args: Parameters<typeof fetch>) => await (await fetch(...args)).json(),
  e => ProjectError.create(safeToolboxTags.fetch, `${e}`)
)
