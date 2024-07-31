import type { Lazy } from './lazy'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type BlobType = any

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type EmptyType = {}

export type Mutable<T> = {
  -readonly [K in keyof T]: Mutable<T[K]>
}

export type Promisify<T> = T | PromiseLike<T> | Lazy<T>

export type Fn<T, U> = (...args: T[]) => U

export const isDev = !Bun.env.NODE_ENV || Bun.env.NODE_ENV === 'development'

export const deepFreeze = (object: BlobType) => {
  const propNames = Reflect.ownKeys(object)

  for (const name of propNames) {
    const value = object[name]

    if ((value && typeof value === 'object') || typeof value === 'function') {
      deepFreeze(value)
    }
  }

  return Object.freeze(object)
}

export const getCircularReplacer = () => {
  const ancestors: BlobType[] = []
  return function (this: unknown, _key: string, value: unknown) {
    if (typeof value !== 'object' || value === null) {
      return value
    }
    // `this` is the object that value is contained in,
    // i.e., its direct parent.
    while (ancestors.length > 0 && ancestors.at(-1) !== this) {
      ancestors.pop()
    }
    if (ancestors.includes(value)) {
      return '[Circular]'
    }
    ancestors.push(value)
    return value
  }
}
