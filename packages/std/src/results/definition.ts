import type { BlobType, LiteralUnion } from '../shared'

import type { resultTags } from './tag'
import type { Err } from './utils/err'
import type { Ok } from './utils/ok'
import type { Tags } from './utils/tag'

declare global {
  /**
   * Std namespace is used to merge types in all projects.
   */
  namespace Std {
    // ------------ Errors ------------

    /**
     * The interface where we combine tags in each project
     */
    interface CustomErrors {}

    /**
     * Use this instead of CustomErrors. CustomErrors is for overriding
     */
    interface Error extends Std.CustomErrors {
      'std/results': typeof resultTags
    }

    type ExtractErrors<T> = T extends Tags<infer U, infer T>
      ? U extends [infer K, never]
        ? K extends string
          ? `${T}.${K}`
          : never
        : `${T}.${U['1']}`
      : never

    /**
     * Shortcut for union intersection of Sirtuils.Error values
     */
    type ErrorValues = LiteralUnion<Std.ExtractErrors<Std.Error[keyof Std.Error]>, `?${string}`>

    type InferOkType<R> = R extends Std.Result<infer T, BlobType, BlobType[]> ? T : never
    type InferNameType<R> = R extends Err<BlobType, infer N, BlobType[]> ? N : never
    type InferCauseType<R> = R extends Err<BlobType, BlobType, infer C> ? C : []

    interface ResultType<T, N extends Std.ErrorValues = never, C extends Std.ErrorValues[] = []> {
      /**
       * Used to check if a `Result` is an `OK`
       *
       * @returns `true` if the result is an `OK` variant of Result
       */
      isOk(): this is Ok<T, N, C>

      /**
       * Used to check if a `Result` is an `Err`
       *
       * @returns `true` if the result is an `Err` variant of Result
       */
      isErr(): this is Err<T, N, C>

      /**
       * Unwrap the `Ok` value, or return the default if there is an `Err`
       *
       * @param value the default value to return if there is an `Err`
       */
      else<A>(value: A): T | A

      /**
       * Returns the first `Ok`, if `Ok` doesnt exists returns the last error
       */
      or<A extends Std.Result<BlobType, BlobType, BlobType>>(value: A): Std.Result<T, N, C> | A

      unwrap(): T
    }

    type Result<T, N extends Std.ErrorValues = BlobType, C extends Std.ErrorValues[] = BlobType[]> =
      | Ok<T, N, C>
      | Err<T, N, C>

    type UnionsToResult<
      U,
      O = Extract<U, Ok<BlobType, BlobType, BlobType>>,
      E = Extract<U, Err<BlobType, BlobType, BlobType>>,
    > = O | E extends never
      ? never
      : Std.Result<Std.InferOkType<O>, Std.InferNameType<E>, Std.InferCauseType<E>>

    type InjectError<
      U,
      N extends Std.ErrorValues,
      C extends Std.ErrorValues[],
    > = U extends Std.Result<infer O, infer Un, infer Uc>
      ? Std.Result<
          O,
          Un | N,
          Uc[number] | C[number] extends never ? [] : (Uc[number] | C[number])[]
        >
      : never
  }
}
