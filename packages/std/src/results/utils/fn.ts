import type { BlobType } from '../../shared'

import { Err } from './err'
import { Ok, ok } from './ok'

export const $fn = <A extends BlobType[], R, C extends Std.ErrorValues = never>(
  fn: (...args: A) => R,
  additionalCause?: C
): ((...args: A) => Std.InjectError<Std.UnionsToResult<R>, never, C extends never ? [] : [C]>) => {
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
