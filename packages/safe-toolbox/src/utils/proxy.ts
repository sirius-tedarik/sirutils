import { type BlobType, ProjectError, capsule, wrap } from '@sirutils/core'

import { isFunction } from './types'

/**
 * Converts an object to a proxy where all functions in it wrapped with capsule
 */
export const proxy = <T extends object>(
  mainData: T,
  tag: Sirutils.ErrorValues,
  safe = false
): T => {
  return new Proxy(mainData, {
    get: (...args) => {
      const [target, prop] = args

      if (prop === Symbol.toStringTag) {
        return target
      }

      const data = Reflect.get(...args)

      if (typeof data === 'undefined' && prop !== 'then' && !safe) {
        ProjectError.create(
          tag,
          `Cannot read properties of context.undefined reading(${prop as string})`
        ).throw()
      }

      if (isFunction(data)) {
        return capsule(
          data.bind(mainData),
          prop as BlobType,
          `${tag}#${String(prop)}` as Sirutils.ErrorValues
        )
      }

      return data
    },
    set: (...args) => {
      return Reflect.set(...args)
    },
  }) as T
}

/**
 * Converts an object to a proxy where all functions in it wrapped with wrap
 */
export const wraproxy = <T extends object>(
  mainData: T,
  tag: Sirutils.ErrorValues,
  safe = false
): Sirutils.Wraproxy<T> => {
  return new Proxy(mainData, {
    get: (...args) => {
      const [target, prop] = args

      if (prop === Symbol.toStringTag) {
        return target
      }

      const data = Reflect.get(...args)

      if (typeof data === 'undefined' && prop !== 'then' && !safe) {
        ProjectError.create(
          tag,
          `Cannot read properties of context.undefined reading(${prop as string})`
        ).throw()
      }

      if (isFunction(data)) {
        return wrap(
          data.bind(mainData),
          prop as BlobType,
          `${tag}#${String(prop)}` as Sirutils.ErrorValues
        )
      }

      return data
    },
    set: (...args) => {
      return Reflect.set(...args)
    },
  }) as Sirutils.Wraproxy<T>
}
