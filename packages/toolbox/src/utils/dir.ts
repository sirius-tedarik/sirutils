import fsAsync from 'node:fs/promises'
import { ProjectError, ResultAsync } from '@sirutils/core'

import { toolboxTags } from '../tag'

/**
 * Reads the contents of a directory at the specified path, with an optional recursive flag to list files and subdirectories,
 * and returns a ResultAsync that either resolves to the directory contents or handles any errors.
 */
export const readdir = ResultAsync.fromThrowable(
  (path: string, recursive = true) => fsAsync.readdir(path, { recursive }),
  e => ProjectError.create(toolboxTags.readdir, `${e}`)
)
