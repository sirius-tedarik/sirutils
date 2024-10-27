import type { BlobType } from '../../shared'

import { resultTags } from '../tag'
import { Err, err } from './err'
import { Ok, ok } from './ok'

const invalidUsage = resultTags.get('invalid-usage')
const cause = resultTags.get('try')

export const $try = <
  R,
  R2,
  O extends Exclude<R | R2, Ok<BlobType, BlobType, BlobType[]> | Err<BlobType, BlobType, BlobType>>,
  C extends Std.ErrorValues = never,
>(
  body: () => Generator<R, R2>,
  additionalCause?: C
): Std.InjectError<
  Std.UnionsToResult<R | R2 | (O extends never ? never : Ok<O, never, never>)>,
  typeof invalidUsage,
  C extends never ? (typeof cause)[] : (typeof cause | C)[]
> => {
  const n = body().next()

  if (n.value instanceof Err) {
    if (additionalCause) {
      n.value.appendCause(additionalCause)
    }

    return n.value as BlobType
  }

  if (n.value instanceof Ok) {
    return n.value as BlobType
  }

  if (!n.done) {
    return err(invalidUsage, 'dont use other generators/iterators').appendCause(cause) as BlobType
  }

  return ok(n.value) as BlobType
}
