import { type BlobType, isPromise } from '../../shared'

import { ResultAsync } from './async'
import { Err } from './err'
import { Ok, ok } from './ok'

export const extractNestedResult = (value: BlobType): Std.Result<BlobType, BlobType, BlobType> => {
  let result = value

  while (result instanceof Ok) {
    result = result.value
  }

  if (result instanceof Err) {
    return result
  }

  return ok(result)
}

export const extractNestedAsyncResult = (
  value: BlobType
): ResultAsync<BlobType, BlobType, BlobType> => {
  return new ResultAsync(
    value.then(async (rawData: BlobType) => {
      const data = rawData.value ?? rawData

      if (data instanceof Err) {
        return data
      }

      if (data instanceof Ok) {
        return extractNestedResult(data)
      }

      let result = data

      while (isPromise(result)) {
        const awaited = await result

        if (awaited instanceof Err) {
          return awaited
        }

        if (awaited instanceof Ok) {
          return extractNestedResult(awaited)
        }

        result = awaited.value ?? awaited
      }

      return ok(result)
    })
  )
}
