import { ProjectError, ResultAsync } from '@sirutils/core'

import { toolboxTags } from '../tag'

export const fetchJson = ResultAsync.fromThrowable(
  async (...args: Parameters<typeof fetch>) => await (await fetch(...args)).json(),
  e => ProjectError.create(toolboxTags.fetch, `${e}`)
)
