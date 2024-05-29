import fsAsync from 'node:fs/promises'

import { ProjectError, ResultAsync } from '@sirutils/core'

import { ENV } from '../internal/consts'
import { toolboxTags } from '../tag'

export const fileExists = ResultAsync.fromThrowable(
  async (path: string) => {
    if (ENV.target === 'bun') {
      return await Bun.file(path).exists()
    }

    return await fsAsync.exists(path)
  },
  e => ProjectError.create(toolboxTags.fileExists, `${e}`)
)

export const readJsonFile = ResultAsync.fromThrowable(
  async <T>(path: string): Promise<T> => {
    if (ENV.target === 'bun') {
      return await Bun.file(path).json()
    }

    return JSON.parse((await fsAsync.readFile(path)).toString())
  },
  e => ProjectError.create(toolboxTags.readJsonFile, `${e}`)
)
