import { type Err, Result, ResultAsync, err, ok } from 'neverthrow'

import { coreTags } from '../tag'
import type { BlobType, Promisify } from '../utils/common'

type ErrorValues = Sirutils.Error[keyof Sirutils.Error]

export class ProjectError extends Error {
  constructor(
    public name: ErrorValues,
    public message: string,
    public cause: string[] = [],
    public data: BlobType[] = []
  ) {
    super()
  }

  appendCause(additionalCause?: ErrorValues) {
    if (additionalCause && this.cause[this.cause.length - 1] !== additionalCause) {
      this.cause.push(additionalCause)
    }

    return this
  }

  asResult(additionalCause?: ErrorValues) {
    return err(this.appendCause(additionalCause))
  }

  /**
   * checks references only if object-like data is passed
   */
  appendData(data?: BlobType[]) {
    if (!this.data.includes(data)) {
      this.data.push(data)
    }

    return this
  }

  static create = (name: ErrorValues, message: string, cause?: BlobType) => {
    if (cause) {
      return new ProjectError(name, message, [cause])
    }

    return new ProjectError(name, message)
  }
}

export const unwrap = <T, E extends Sirutils.ProjectErrorType>(
  result: Result<T, E>,
  additionalCause?: ErrorValues
): T | never => {
  if (result.isErr()) {
    if (additionalCause) {
      result.error.appendCause(additionalCause)
    }

    throw result.error
  }

  return result.value
}

export const group = <T, E extends Sirutils.ProjectErrorType>(
  body: () => T,
  additionalCause: ErrorValues
): Result<T, E> => {
  try {
    return ok(body())
  } catch (e) {
    if (e instanceof ProjectError) {
      return e.asResult(additionalCause) as unknown as Err<T, E>
    }

    return ProjectError.create(
      coreTags.group,
      `${e}`,
      additionalCause
    ).asResult() as unknown as Err<T, E>
  }
}

export const groupAsync = async <T, E extends Sirutils.ProjectErrorType>(
  body: () => Promisify<T>,
  additionalCause: ErrorValues
): Promise<Result<T, E>> => {
  try {
    return ok(await body())
  } catch (e) {
    if (e instanceof ProjectError) {
      return e.asResult(additionalCause) as unknown as Err<T, E>
    }

    return ProjectError.create(
      coreTags.groupAsync,
      `${e}`,
      additionalCause
    ).asResult() as unknown as Err<T, E>
  }
}

export const wrap = <A extends BlobType[], T, E extends Sirutils.ProjectErrorType>(
  body: (...args: A) => T,
  additionalCause: ErrorValues
) => {
  return Result.fromThrowable(
    body,
    e =>
      (e instanceof ProjectError
        ? e.appendCause(additionalCause)
        : ProjectError.create(coreTags.wrap, `${e}`, additionalCause)) as E
  )
}

export const wrapAsync = <A extends BlobType[], T, E extends Sirutils.ProjectErrorType>(
  body: (...args: A) => PromiseLike<T>,
  additionalCause: ErrorValues
) => {
  return (...args: A) =>
    ResultAsync.fromPromise<T, E>(
      Promise.resolve(body(...args)),
      e =>
        (e instanceof ProjectError
          ? e.appendCause(additionalCause)
          : ProjectError.create(coreTags.wrapAsync, `${e}`, additionalCause)) as E
    )
}
