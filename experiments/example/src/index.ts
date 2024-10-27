import './definition'

import { Err, err, fromThrowable } from '@sirutils/std/results'

import { exampleTags } from './tag'
import { $sayHi } from './users/say-hi'

// biome-ignore lint/suspicious/noConsole: Redundant
console.log($sayHi('alice').unwrap())

const a = fromThrowable(
  (path: string, data: string) => Bun.write(path, data),
  e =>
    (e instanceof Err
      ? (e as Err<never, never, never>).appendCause(exampleTags.get('write'))
      : err(exampleTags.get('write'), 'unexpected').appendCause(exampleTags.get('write'))
    ).appendData(e)
)

export * from './tag'
