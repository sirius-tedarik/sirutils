import { ProjectError, Result, ResultAsync } from '@sirutils/core/dist'
import { schemaTags } from '../tag'

export const isURL = Result.fromThrowable(
  (url: string) => new URL(url),
  e => ProjectError.create(schemaTags.isURL, `${e}`)
)

export const fetchJson = ResultAsync.fromThrowable(
  async (...args: Parameters<typeof fetch>) => await (await fetch(...args)).json(),
  e => ProjectError.create(schemaTags.fetch, `${e}`)
)
