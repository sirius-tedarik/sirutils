import { forward, forwardAsync, forwardEither } from '../result/error'
import type { BlobType, Fn } from '../utils/common'

export const createActions = <
  const C extends (context: Sirutils.Context.PluginContext<BlobType, BlobType>) => BlobType,
>(
  cb: C,
  cause: Sirutils.ErrorValues
) => {
  return (context: Parameters<C>[0], additionalCause: Sirutils.ErrorValues) => {
    return forward(() => {
      const result = cb(context)

      return Object.fromEntries(
        Object.entries(result).map(([k, v]) => [
          k,
          typeof v === 'function'
            ? (...args: BlobType[]) =>
                forwardEither(
                  () => {
                    return (v as Fn<BlobType, BlobType>)(...args)
                  },
                  k as Sirutils.ErrorValues,
                  cause,
                  additionalCause,
                  context.$cause
                )
            : v,
        ])
      ) as ReturnType<C>
    }, cause)
  }
}

export const createActionsAsync = <
  const C extends (context: Sirutils.Context.PluginContext<BlobType, BlobType>) => BlobType,
>(
  cb: C,
  cause: Sirutils.ErrorValues
) => {
  return (context: Parameters<C>[0], additionalCause: Sirutils.ErrorValues) => {
    return forwardAsync(async () => {
      const result = await cb(context)

      return Object.fromEntries(
        Object.entries(result).map(([k, v]) => [
          k,
          typeof v === 'function'
            ? (...args: BlobType[]) =>
                forwardEither(
                  () => {
                    return (v as Fn<BlobType, BlobType>)(...args)
                  },
                  k as Sirutils.ErrorValues,
                  cause,
                  additionalCause,
                  context.$cause
                )
            : v,
        ])
      ) as ReturnType<C> extends Promise<infer T> ? T : never
    }, cause)
  }
}
