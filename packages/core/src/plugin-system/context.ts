import type { UnknownRecord } from 'type-fest'

import { ProjectError } from '../result/error'
import { pluginSystemTags } from '../tag'
import type { BlobType } from '../utils/common'

/**
 * The createContext function creates a proxy-based context object with an optional initialization callback and default values, allowing for dynamic property access and error handling.
 * If the initialization callback throws a ProjectError, it appends additional context and rethrows the error.
 * The proxy intercepts property accesses, throwing a ProjectError if an undefined property is accessed, ensuring robust error handling and context management.
 */
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
          ProjectError.create(
            pluginSystemTags.contextUnexpected,
            `Cannot read properties of context.undefined reading(${prop as string})`,
            cause
          ).throw()
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
