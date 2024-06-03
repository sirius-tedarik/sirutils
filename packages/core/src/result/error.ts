import { type Err, Result, ResultAsync, err, ok } from 'neverthrow'

import { coreTags } from '../tag'
import type { BlobType, Promisify } from '../utils/common'

export class ProjectError extends Error {
  constructor(
    public name: Sirutils.ErrorValues,
    public message: string,
    public cause: Sirutils.ErrorValues[] = [],
    public data: BlobType[] = []
  ) {
    super()
  }

  appendCause(additionalCause?: Sirutils.ErrorValues) {
    if (additionalCause && this.cause[this.cause.length - 1] !== additionalCause) {
      this.cause.push(additionalCause)
    }

    return this
  }

  appendCauses(...additionalCause: Sirutils.ErrorValues[]) {
    for (const cause of additionalCause) {
      this.appendCause(cause)
    }

    return this
  }

  asResult(additionalCause?: Sirutils.ErrorValues) {
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

  static create = (name: Sirutils.ErrorValues, message: string, cause?: Sirutils.ErrorValues) => {
    if (cause) {
      return new ProjectError(name, message, [cause])
    }

    return new ProjectError(name, message)
  }
}

export const unwrap = <T, E extends Sirutils.ProjectErrorType>(
  result: Result<T, E>,
  additionalCause?: Sirutils.ErrorValues
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
  additionalCause: Sirutils.ErrorValues
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
  additionalCause: Sirutils.ErrorValues
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
  additionalCause: Sirutils.ErrorValues
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
  additionalCause: Sirutils.ErrorValues
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

export const forward = <T, E extends Sirutils.ProjectErrorType>(
  body: () => T,
  ...additionalCauses: Sirutils.ErrorValues[]
): T => {
  try {
    return body()
  } catch (e) {
    if (e instanceof ProjectError) {
      throw e.appendCauses(...additionalCauses) as unknown as Err<T, E>
    }

    throw ProjectError.create(coreTags.forward, `${e}`).appendCauses(
      ...additionalCauses
    ) as unknown as Err<T, E>
  }
}
