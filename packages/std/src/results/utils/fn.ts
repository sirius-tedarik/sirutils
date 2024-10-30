import { type BlobType, isPromise } from '../../shared'

import { Err } from './err'
import { extractNestedAsyncResult, extractNestedResult } from './extract'
import { Ok, ok } from './ok'

export const $fn = <A extends BlobType[], R, C extends Std.ErrorValues = never>(
  fn: (...args: A) => R,
  additionalCause?: C
): ((...args: A) => Std.InjectError<Std.UnionsToResult<R>, never, C extends never ? [] : [C]>) => {
  return ((...args: A) => {
    const result = fn(...args)

    if (isPromise(result)) {
      return extractNestedAsyncResult(result)
    }

    if (!(result instanceof Err || result instanceof Ok)) {
      return ok(result)
    }

    if (result.isErr() && additionalCause) {
      result.appendCause(additionalCause)
    }

    return extractNestedResult(result)
  }) as BlobType
}
