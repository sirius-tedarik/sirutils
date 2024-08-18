import type { Fn, Promisify } from './common'

type RawExecutor<T> = (
  resolve: (value: T) => void,
  reject: (error: Sirutils.ProjectErrorType) => void
) => void

/**
 * The Lazy class implements a deferred promise that only executes its provided executor when accessed
 * via .then() or .catch(), allowing for lazy evaluation of asynchronous operations.
 */
export class Lazy<T> implements PromiseLike<T> {
  #promise?: Promise<T>
  #executor: RawExecutor<T>

  constructor(executor: RawExecutor<T>) {
    this.#executor = executor
  }

  static from<T>(fn: Fn<never, Promisify<T>>) {
    return new Lazy(resolve => {
      resolve(fn())
    })
  }

  // biome-ignore lint/suspicious/noThenProperty: Redundant
  get then() {
    if (!this.#promise) {
      this.#promise = new Promise<T>(this.#executor)
    }
    return this.#promise.then.bind(this.#promise)
  }

  get catch() {
    if (!this.#promise) {
      this.#promise = new Promise<T>(this.#executor)
    }
    return this.#promise.catch.bind(this.#promise)
  }
}
