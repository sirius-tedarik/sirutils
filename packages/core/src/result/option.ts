import type { BlobType } from '../utils/common'

/**
 * Represents a value that exists and provides methods to check presence (isSome),
 * handle alternative values (orElse, unwrapOr), and access the contained value (unwrap).
 */
export class Some<T> {
  constructor(public value: T) {}

  isSome(): this is Some<T> {
    return true
  }

  isNone(): this is None {
    return false
  }

  orElse<U>(_value: U): Some<T> {
    return this
  }

  unwrapOr<U>(_value: U): T {
    return this.value
  }

  unwrap(): T {
    return this.value
  }
}

/**
 * Represents the absence of a value, with methods to check absence (isNone),
 * provide alternative values (orElse, unwrapOr), and safely access a null value (unwrap).
 */
export class None {
  value = null

  isSome(): this is Some<never> {
    return false
  }

  isNone(): this is None {
    return true
  }

  orElse<U>(value: U): Some<U> {
    return new Some(value)
  }

  unwrapOr<U>(value: U): U {
    return value
  }

  unwrap() {
    return this.value
  }
}

/**
 * Creates an instance of Some to wrap a non-null value, indicating that a value is present.
 */
export const some = <T>(value: T): Some<T> => new Some(value)

/**
 * Creates an instance of None to represent the absence of a value.
 */
export const none = (): None => new None()

/**
 * Automatically wraps a given value in Some if it exists or None if it is null or undefined,
 * allowing for dynamic handling of optional values.
 */
export const auto = <T>(data: T): T extends undefined ? None : T extends null ? None : Some<T> =>
  (data === null || typeof data === 'undefined' ? none() : some(data)) as BlobType

/**
 * A union type representing either a Some value or None,
 * enabling safe handling of optional values.
 */
export type Option<T> = Some<T> | None
