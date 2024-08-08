import { type BlobType, ProjectError, capsule } from '@sirutils/core'

import { isFunction } from './types'

export const proxy = <T extends object>(mainData: T, tag: Sirutils.ErrorValues): T => {
  return new Proxy(mainData, {
    get: (...args) => {
      const [target, prop] = args

      if (prop === Symbol.toStringTag) {
        return target
      }

      const data = Reflect.get(...args)

      if (typeof data === 'undefined' && prop !== 'then') {
        ProjectError.create(
          tag,
          `Cannot read properties of context.undefined reading(${prop as string})`
        ).throw()
      }

      if (isFunction(data)) {
        return capsule(data.bind(mainData), prop as BlobType, tag)
      }

      return data
    },
    set: (...args) => {
      return Reflect.set(...args)
    },
  }) as T
}
