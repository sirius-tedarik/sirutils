import type { Spreadable } from 'type-fest/source/spread'

import { capsule } from '../result/error'
import { coreTags } from '../tag'
import type { BlobType, Fn } from '../utils/common'

/**
 * The createActions function generates a set of actions from a callback by encapsulating any functions in the result with additional error handling and context information.
 */
export const createActions = <
  const R extends Spreadable,
  const C extends (context: Sirutils.PluginSystem.Context<BlobType, BlobType>) => R,
>(
  cb: C,
  cause: Sirutils.ErrorValues
) => {
  return capsule(
    async (context: Parameters<C>[0], additionalCause: Sirutils.ErrorValues) => {
      const result = await cb(context)

      return Object.fromEntries(
        Object.entries(result).map(([k, v]) => [
          k,
          typeof v === 'function'
            ? capsule(
                v as Fn<BlobType, BlobType>,
                `${cause}#${k}` as Sirutils.ErrorValues,
                coreTags.createActions,
                additionalCause,
                context.$cause
              )
            : v,
        ])
      ) as Awaited<ReturnType<C>>
    },
    cause,
    coreTags.createActions
  )
}
