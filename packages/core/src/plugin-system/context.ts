import type { UnknownRecord } from 'type-fest'

import { ProjectError, unwrap, wrap } from '../result/error'
import { pluginSystemTags } from '../tag'
import type { BlobType } from '../utils/common'

export const createContext = <R, const A extends BlobType[] = BlobType[]>(
  cb: (context: R, ...args: A) => unknown,
  cause: Sirutils.ErrorValues,
  defaultValues?: NoInfer<R>
) => {
  const context = new Proxy(defaultValues ?? ({} as unknown as UnknownRecord), {
    get: (...args) => {
      const [target, prop] = args

      if (prop === Symbol.toStringTag) {
        return target
      }

      const data = Reflect.get(...args)

      if (typeof data === 'undefined' && prop !== 'then') {
        unwrap(
          ProjectError.create(
            pluginSystemTags.contextUnexpected,
            `Cannot read properties of context.undefined reading(${prop as string})`,
            cause
          ).asResult()
        )
      }

      return data
    },
    set: (...args) => {
      return Reflect.set(...args)
    },
  }) as unknown as R

  const safeCb = wrap((...args: A) => {
    if (args.length > -1) {
      cb(context, ...args)
    }

    return context
  }, cause)

  return ((...args: A) => {
    if (args.length > -1) {
      unwrap(safeCb(...args), pluginSystemTags.useContext)
    }

    return context
  }) as Sirutils.Context.Use<R, A>
}
