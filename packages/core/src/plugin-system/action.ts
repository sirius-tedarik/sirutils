import { forward, forwardAsync, forwardEither } from '../result/error'
import type { BlobType, Fn } from '../utils/common'

export const createActions = <const C extends (app: Sirutils.PluginSystem.App) => BlobType>(
  cb: C,
  cause: Sirutils.ErrorValues
) => {
  return (context: Parameters<C>[0], additionalCause: Sirutils.ErrorValues) => {
    return forward(() => {
      const result = cb(context)

      return Object.fromEntries(
        Object.entries(result).map(([k, v]) => [
          k,
          (...args: BlobType[]) =>
            forwardEither(
              () => {
                return (v as Fn<BlobType, BlobType>)(...args)
              },
              k as Sirutils.ErrorValues,
              cause,
              additionalCause,
              context.$cause
            ),
        ])
      ) as ReturnType<C>
    }, cause)
  }
}

export const createActionsAsync = <
  const C extends (app: Sirutils.PluginSystem.App) => PromiseLike<BlobType>,
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
          (...args: BlobType[]) =>
            forwardEither(
              () => {
                return (v as Fn<BlobType, BlobType>)(...args)
              },
              k as Sirutils.ErrorValues,
              cause,
              additionalCause,
              context.$cause
            ),
        ])
      ) as ReturnType<C> extends Promise<infer T> ? T : never
    }, cause)
  }
}
