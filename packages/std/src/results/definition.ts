import type { Err } from './utils/err'
import type { Ok } from './utils/ok'

declare global {
  /**
   * Std namespace is used to merge types in all projects.
   */
  namespace Std {
    interface ResultType<T, E extends Std.ProjectErrorType> {
      /**
       * Used to check if a `Result` is an `OK`
       *
       * @returns `true` if the result is an `OK` variant of Result
       */
      isOk(): this is Ok<T, E>

      /**
       * Used to check if a `Result` is an `Err`
       *
       * @returns `true` if the result is an `Err` variant of Result
       */
      isErr(): this is Err<T, E>

      unwrap(): T
    }

    type Result<T> = Ok<T, Std.ProjectErrorType> | Err<T, Std.ProjectErrorType>

    type InferOkType<R> = R extends Std.Result<infer T> ? T : never
  }
}
