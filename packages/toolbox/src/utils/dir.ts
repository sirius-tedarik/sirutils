import fsAsync from 'node:fs/promises'
import { ProjectError, ResultAsync } from '@sirutils/core'

import { toolboxTags } from '../tag'

export const readdir = ResultAsync.fromThrowable(
  (path: string, recursive = true) => fsAsync.readdir(path, { recursive }),
  e => ProjectError.create(toolboxTags.readdir, `${e}`)
)
