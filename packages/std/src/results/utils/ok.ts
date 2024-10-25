import type { Err } from './err'

export class Ok<T, E extends Std.ProjectErrorType> implements Std.ResultType<T, E> {
  constructor(readonly value: T) {}

  isOk(): this is Ok<T, E> {
    return true
  }

  isErr(): this is Err<T, E> {
    return !this.isOk()
  }

  unwrap(): T {
    return this.value
  }

  // biome-ignore lint/correctness/useYield: Redundant
  *[Symbol.iterator](): Generator<Err<never, E>, T> {
    return this.value
  }
}

export const ok = <T, E extends Std.ProjectErrorType = never>(value: T): Ok<T, E> => new Ok(value)
