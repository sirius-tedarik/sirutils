import type { BlobType } from '../../shared'

import { ResultAsync } from './async'
import { Ok } from './ok'

export const fromAsyncThrowable = <A extends readonly BlobType[], T, R>(
  fn: (...args: A) => Promise<T>,
  errorFn: (err: unknown) => R
): ((
  ...args: A
) => ResultAsync<
  T,
  Std.InferNameType<Std.UnionsToResult<R>>,
  Std.InferCauseType<Std.UnionsToResult<R>>
>) => {
  return ((...args: BlobType) => {
    return new ResultAsync(
      (async () => {
        try {
          return new Ok(await fn(...args))
        } catch (error) {
          return errorFn(error) as BlobType
        }
      })()
    )
  }) as BlobType
}
