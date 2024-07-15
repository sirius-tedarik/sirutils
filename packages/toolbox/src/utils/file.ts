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

export const writeFile = ResultAsync.fromThrowable(
  async (path: string, data: string | Blob | NodeJS.TypedArray | ArrayBufferLike) => {
    if (ENV.target === 'bun') {
      return await Bun.write(path, data)
    }

    return fsAsync.writeFile(path, data.toString())
  },
  e => ProjectError.create(toolboxTags.writeFile, `${e}`)
)

export const writeJsonFile = ResultAsync.fromThrowable(
  async <T>(path: string, data: T, pretty = false) => {
    const stringified = JSON.stringify(data, null, pretty ? 2 : 0)

    if (ENV.target === 'bun') {
      return await Bun.write(path, stringified)
    }

    return fsAsync.writeFile(path, stringified)
  },
  e => ProjectError.create(toolboxTags.writeJsonFile, `${e}`)
)
