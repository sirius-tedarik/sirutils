import type { Lazy } from './lazy'

/**
 * Use this type in cases where any is mandatory. The use of any in the project is prohibited to prevent unconscious copy paste situations.
 * @link any
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type BlobType = any

/**
 * @link https://www.totaltypescript.com/the-empty-object-type-in-typescript
 */
// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type EmptyType = {}

/**
 * @link https://stackoverflow.com/questions/62038161/typescript-mutability-and-inversion-of-readonlyt
 */
export type Mutable<T> = {
  -readonly [K in keyof T]: Mutable<T[K]>
}

export type Promisify<T> = T | PromiseLike<T> | Lazy<T>

/**
 * Shortcut for function definition
 */
export type Fn<T, U> = (...args: T[]) => U

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

/**
 * You can use this if you get "cyclic object value" error when using JSON.stringify()
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
 */
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
