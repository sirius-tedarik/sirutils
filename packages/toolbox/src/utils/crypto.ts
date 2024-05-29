import crypto from 'node:crypto'
import fs from 'node:fs'
import { ProjectError, Result, ResultAsync } from '@sirutils/core'

import type { CryptoHasher } from 'bun'

import { ENV } from '../internal/consts'
import { toolboxTags } from '../tag'

export const getChecksum = Result.fromThrowable(
  (data: Bun.BlobOrStringOrBuffer) => {
    const hasher = (ENV.target === 'bun'
      ? new Bun.CryptoHasher('blake2b512')
      : crypto.createHash('sha512')) as unknown as CryptoHasher

    hasher.update(data.toString())

    return hasher.digest('hex')
  },
  e => ProjectError.create(toolboxTags.getChecksum, `${e}`)
)

export const getFileChecksum = ResultAsync.fromThrowable(
  (path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const input = fs.createReadStream(path)
      const hasher = (ENV.target === 'bun'
        ? new Bun.CryptoHasher('blake2b512')
        : crypto.createHash('sha512')) as unknown as CryptoHasher

      input.on('error', reject)

      input.on('data', chunk => {
        hasher.update(chunk.toString())
      })

      input.on('close', () => {
        resolve(hasher.digest('hex').toString())
      })
    })
  },
  e => ProjectError.create(toolboxTags.getFileChecksum, `${e}`)
)
