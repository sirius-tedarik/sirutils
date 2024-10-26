import type { BlobType } from '../../shared'

import { err, Err } from './err'
import { Ok, ok } from './ok'

export const safeTry = <
  R,
  R2,
  O extends Exclude<R | R2, Ok<BlobType, BlobType, BlobType[]> | Err<BlobType, BlobType, BlobType>>,
  C extends Std.ErrorValues = never,
>(
  body: () => Generator<R, R2>,
  additionalCause?: C
): Std.InjectError<
  Std.UnionsToResult<R | R2 | (O extends never ? never : Ok<O, never, never>)>,
  '?invalid-use',
  C extends never ? [] : [C]
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
    return err('?invalid-use', 'safeTry') as BlobType
  }

  return ok(n.value) as BlobType
}
