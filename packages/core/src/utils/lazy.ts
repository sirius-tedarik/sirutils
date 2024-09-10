import { ProjectError } from '../result/error'
import { coreTags } from '../tag'
import type { BlobType } from './common'

/**
 * The Lazy class implements a deferred promise that only executes its provided executor when accessed
 * via .then() or .catch(), allowing for lazy evaluation of asynchronous operations.
 */
export class Lazy<T> extends Promise<T> {
  #executor: (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: BlobType) => void
  ) => void
  #promise: Promise<T> | null = null
  #causes: Sirutils.ErrorValues[] = []

  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: BlobType) => void
    ) => void
  ) {
    super(resolve => {
      // @ts-expect-error
      resolve()
    })
    this.#executor = executor
  }

  static from<U>(promise: () => Promise<U> | U) {
    return new Lazy<U>(resolve => {
      resolve(promise())
    })
  }

  private get promise() {
    if (!this.#promise) {
      this.#promise = new Promise<T>(this.#executor)
    }
    return this.#promise
  }

  // biome-ignore lint/suspicious/noThenProperty: <explanation>
  then<TResult1 = T, TResult2 = never>(
    onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onRejected?: ((reason: BlobType) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onFulfilled, rawError => {
      const error =
        rawError instanceof ProjectError
          ? rawError.appendCause(...this.#causes).appendData(rawError)
          : ProjectError.create(coreTags.lazy, 'catch missused', ...this.#causes).appendData(
              rawError
            )

      if (onRejected) {
        return onRejected(error)
      }

      return undefined as never
    })
  }

  catch<TResult = never>(
    onRejected?: ((reason: BlobType) => TResult | PromiseLike<TResult>) | undefined | null
  ): Promise<T | TResult> {
    return this.promise.catch(rawError => {
      const error =
        rawError instanceof ProjectError
          ? rawError.appendCause(...this.#causes).appendData(rawError)
          : ProjectError.create(coreTags.lazy, 'catch missused', ...this.#causes).appendData(
              rawError
            )

      if (onRejected) {
        return onRejected(error)
      }

      return undefined as never
    })
  }

  finally(onFinally?: (() => void) | undefined | null): Promise<T> {
    return this.promise.finally(onFinally)
  }

  appendCause(...causes: Sirutils.ErrorValues[]) {
    for (const cause of causes) {
      if (cause && this.#causes[this.#causes.length - 1] !== cause) {
        this.#causes.push(cause)
      }
    }

    return this
  }
}
