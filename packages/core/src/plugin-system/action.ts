import { capsule } from '../result/error'
import { coreTags } from '../tag'
import type { BlobType, Fn } from '../utils/common'

export const createActions = <
  const C extends (context: Sirutils.PluginSystem.Context<BlobType, BlobType>) => BlobType,
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
                k as Sirutils.ErrorValues,
                cause,
                additionalCause,
                context.$cause,
                coreTags.createActions
              )
            : v,
        ])
      ) as Awaited<ReturnType<C>>
    },
    cause,
    coreTags.createActions
  )
}
