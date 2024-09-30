import type { BlobType, Fn } from '@sirutils/core'

import type { SafeToolboxTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      safeToolbox: SafeToolboxTags
    }

    /**
     * Converts the value part of an object type data to a Result/AsyncResult
     */
    type Wraproxy<T> = {
      [P in keyof T]: T[P] extends Fn<BlobType[], infer R>
        ? (
            ...args: Parameters<T[P]>
          ) => R extends PromiseLike<infer V>
            ? Sirutils.ProjectAsyncResult<V>
            : Sirutils.ProjectResult<R>
        : T[P]
    }
  }
}
