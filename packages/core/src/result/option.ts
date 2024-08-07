import type { BlobType } from '../utils/common'

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

export const some = <T>(value: T): Some<T> => new Some(value)
export const none = (): None => new None()
export const auto = <T>(data: T): T extends undefined ? None : T extends null ? None : Some<T> =>
  (data === null || typeof data === 'undefined' ? none() : some(data)) as BlobType

export type Option<T> = Some<T> | None
