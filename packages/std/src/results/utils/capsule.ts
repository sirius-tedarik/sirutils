import type { BlobType } from '../../shared'

import { ResultAsync } from './async'

import { handleCatch, handleThen } from './internal/handlers'

/**
 * The capsule function is used to wrap a function for unknown errors
 * This function doesn't return a Result or AsyncResult
 */
export const capsule = <A extends BlobType[], R>(
  fn: (...args: A) => R,
  ...additionalCauses: Std.ErrorValues[]
): ((...args: A) => R) => {
  return ((...args: A) => {
    try {
      const result = handleThen(fn(...args), ...additionalCauses)

      if (result instanceof ResultAsync) {
        return result.then(data => data.unwrap())
      }

      return result.unwrap()
    } catch (rawError) {
      handleCatch(rawError, ...additionalCauses).throw()
    }
  }) as BlobType
}
