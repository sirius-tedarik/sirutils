import type { BlobType } from '../../shared'

import { Err } from './err'
import { Ok, ok } from './ok'

export const $fn = <
  A extends BlobType[],
  R,
  O extends Exclude<R, Ok<BlobType, BlobType, BlobType[]> | Err<BlobType, BlobType, BlobType>>,
  C extends Std.ErrorValues = never,
>(
  fn: (...args: A) => R,
  additionalCause?: C
): ((
  ...args: A
) => Std.InjectError<
  Std.UnionsToResult<R | (O extends never ? never : Ok<O, never, never>)>,
  never,
  C extends never ? [] : [C]
>) => {
  return ((...args: A) => {
    const result = fn(...args)

    if (!(result instanceof Err || result instanceof Ok)) {
      return ok(result)
    }

    if (result.isErr() && additionalCause) {
      result.appendCause(additionalCause)
    }

    return result
  }) as BlobType
}
