import type { BlobType } from '../../shared'
import { resultTags } from '../tag'

import { handleCatch, handleThen } from './internal/handlers'

const invalidUsage = resultTags.get('invalid-usage')
const cause = resultTags.get('fn')

/**
 * The $fn function is used to wrap a function that returns a Result or ResultAsync
 * and automatically handles the error cases.
 */
export const $fn = <A extends BlobType[], R, C extends Std.ErrorValues[] = []>(
  fn: (...args: A) => R,
  ...additionalCauses: C
): ((
  ...args: A
) => Std.InjectError<Std.UnionsToResult<R>, typeof invalidUsage, C | (typeof cause)[]>) => {
  return ((...args: A) => {
    try {
      const result = fn(...args)

      return handleThen(result, ...additionalCauses) as BlobType
    } catch (rawError) {
      return handleCatch(rawError, ...additionalCauses)
    }
  }) as BlobType
}
