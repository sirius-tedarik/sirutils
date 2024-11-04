import { $fn, err } from '../../results'

import { ioTags } from '../tag'

export const $read = $fn(async (path: string) => {
  const file = Bun.file(path)
  const exists = await file.exists()

  if (!exists) {
    return err(ioTags.get('not-found'), `file: ${path} not found`)
  }

  return Buffer.from(await file.arrayBuffer())
}, ioTags.get('read'))

export const $readJson = $fn(async <T>(path: string) => {
  const file = Bun.file(path)
  const exists = await file.exists()

  if (!exists) {
    return err(ioTags.get('not-found'), `file: ${path} not found`)
  }

  if (!file.type.includes('application/json')) {
    return err(
      ioTags.get('invalid-mime'),
      `file: ${path} file type: ${file.type} cannot be read with this method`
    )
  }

  return (await file.json()) as T
}, ioTags.get('read'))
