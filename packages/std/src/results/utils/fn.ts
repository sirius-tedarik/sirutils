import type { BlobType } from '../../shared'

export const fn = <
  A extends BlobType[],
  R extends Std.Result<BlobType, BlobType, BlobType>,
  C extends Std.ErrorValues = never,
>(
  fn: (...args: A) => R,
  additionalCause?: C
): ((...args: A) => Std.InjectError<Std.UnionsToResult<R>, never, C extends never ? [] : [C]>) => {
  return ((...args: A) => {
    const result = fn(...args)

    if (result.isErr() && additionalCause) {
      result.appendCause(additionalCause)
    }

    return result
  }) as BlobType
}
