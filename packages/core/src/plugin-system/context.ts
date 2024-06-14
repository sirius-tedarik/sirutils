import type { UnknownRecord } from 'type-fest'

import { ProjectError, unwrap } from '../result/error'
import { pluginSystemTags } from '../tag'
import type { BlobType } from '../utils/common'

export const createContext = <T, const A extends BlobType[]>(
  cb: (context: T, ...args: A) => unknown,
  cause: Sirutils.ErrorValues,
  defaultValues?: T
) => {
  const context = new Proxy(
    {
      ...(defaultValues ?? ({} as unknown as UnknownRecord)),

      init: (...args) => {
        try {
          cb(context, ...args)
        } catch (err) {
          if (err instanceof ProjectError) {
            throw err.appendCause(pluginSystemTags.initContext, cause)
          }
        }
      },
    } as Sirutils.Context.Context<T, A>,
    {
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
    }
  )

  return context
}
