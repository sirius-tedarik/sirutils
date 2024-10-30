import { $fn, err } from '../../results'

import { ioTags } from '../tag'

export const $read = $fn(async (path: string) => {
  const file = Bun.file(path)
  const exists = await file.exists()

  if (!exists) {
    return err(ioTags.get('not-found'), `file: ${path} not found`)
  }

  return 'sa'
}, ioTags.get('read'))

// biome-ignore lint/suspicious/noConsole: <explanation>
console.log(await $read('./text'))
