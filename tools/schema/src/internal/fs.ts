import fs from 'fs'
import fsAsync from 'node:fs/promises'
import {ProjectError, Result, ResultAsync} from '@sirutils/core'

import {schemaTags} from '../tag'

export const readdir = ResultAsync.fromThrowable(
  (path: string) => fsAsync.readdir(path, {recursive: true}),
  e => ProjectError.create(schemaTags.readdir, `${e}`)
)

export const readJsonFile = ResultAsync.fromThrowable(
  (path: string) => Bun.file(path).json(),
  e => ProjectError.create(schemaTags.readJsonFile, `${e}`)
)

export const getFileChecksum = ResultAsync.fromThrowable(
  (path: string) => {
    return new Promise((resolve, reject) => {
      const hasher = new Bun.CryptoHasher('blake2b512')
      const input = fs.createReadStream(path)

      input.on('error', reject)

      input.on('data', chunk => {
        hasher.update(chunk)
      })

      input.on('close', () => {
        resolve(hasher.digest('hex'))
      })
    })
  },
  e => ProjectError.create(schemaTags.getFileChecksum, `${e}`)
)

export const getChecksum = Result.fromThrowable(
  (path: string) => {
    return new Promise((resolve, reject) => {
      const hasher = new Bun.CryptoHasher('blake2b512')
      const input = fs.createReadStream(path)

      input.on('error', reject)

      input.on('data', chunk => {
        hasher.update(chunk)
      })

      input.on('close', () => {
        resolve(hasher.digest('hex'))
      })
    })
  },
  e => ProjectError.create(schemaTags.getFileChecksum, `${e}`)
)
