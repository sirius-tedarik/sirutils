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

  appendCause(...additionalCauses: (Sirutils.ErrorValues | undefined)[]) {
    for (const additionalCause of additionalCauses) {
      if (additionalCause && this.cause[this.cause.length - 1] !== additionalCause) {
        this.cause.push(additionalCause)
      }
    }

    return this
  }

  asResult(...additionalCauses: (Sirutils.ErrorValues | undefined)[]) {
    return err(this.appendCause(...additionalCauses))
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

  /**
   * throws without using unwrap
   */
  throw = (...additionalCauses: (Sirutils.ErrorValues | undefined)[]) => {
    throw this.appendCause(...additionalCauses)
  }

  static create = (
    name: Sirutils.ErrorValues,
    message: string,
    ...cause: (Sirutils.ErrorValues | undefined)[]
  ) => {
    if (cause) {
      return new ProjectError(name, message, cause.filter(c => !!c) as Sirutils.ErrorValues[])
    }

    return new ProjectError(name, message)
  }
}

export const unwrap = <T, E extends Sirutils.ProjectErrorType>(
  result: Result<T, E>,
  ...additionalCauses: (Sirutils.ErrorValues | undefined)[]
): T | never => {
  if (result.isErr()) {
    if (additionalCauses) {
      result.error.appendCause(...additionalCauses)
    }

    throw result.error
  }

  return result.value
}

export const group = <T, E extends Sirutils.ProjectErrorType>(
  body: () => T,
  ...additionalCauses: Sirutils.ErrorValues[]
): Result<T, E> => {
  try {
    return ok(body())
  } catch (e) {
    if (e instanceof ProjectError) {
      return e
        .appendData([e])
        .appendCause(...additionalCauses)
        .asResult() as unknown as Err<T, E>
    }

    return ProjectError.create(coreTags.group, `${e}`)
      .appendData([e])
      .appendCause(...additionalCauses)
      .asResult() as unknown as Err<T, E>
  }
}

export const groupAsync = async <T, E extends Sirutils.ProjectErrorType>(
  body: () => Promisify<T>,
  ...additionalCauses: Sirutils.ErrorValues[]
): Promise<Result<T, E>> => {
  try {
    return ok(await body())
  } catch (e) {
    if (e instanceof ProjectError) {
      return e
        .appendData([e])
        .appendCause(...additionalCauses)
        .asResult() as unknown as Err<T, E>
    }

    return ProjectError.create(coreTags.groupAsync, `${e}`)
      .appendData([e])
      .appendCause(...additionalCauses)
      .asResult() as unknown as Err<T, E>
  }
}

export const wrap = <A extends BlobType[], T, E extends Sirutils.ProjectErrorType>(
  body: (...args: A) => T,
  ...additionalCauses: Sirutils.ErrorValues[]
) => {
  return Result.fromThrowable(
    body,
    e =>
      (e instanceof ProjectError
        ? e.appendCause(...additionalCauses)
        : ProjectError.create(coreTags.wrap, `${e}`).appendCause(...additionalCauses)
      ).appendData([e]) as E
  )
}

export const wrapAsync = <A extends BlobType[], T, E extends Sirutils.ProjectErrorType>(
  body: (...args: A) => PromiseLike<T>,
  ...additionalCauses: Sirutils.ErrorValues[]
) => {
  return (...args: A) =>
    ResultAsync.fromPromise<T, E>(
      Promise.resolve(body(...args)),
      e =>
        (e instanceof ProjectError
          ? e.appendCause(...additionalCauses)
          : ProjectError.create(coreTags.wrapAsync, `${e}`).appendCause(...additionalCauses)
        ).appendData([e]) as E
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
      throw e.appendData([e]).appendCause(...additionalCauses) as unknown as Err<T, E>
    }

    throw ProjectError.create(coreTags.forward, `${e}`)
      .appendCause(...additionalCauses)
      .appendData([e]) as unknown as Err<T, E>
  }
}

export const forwardAsync = async <T, E extends Sirutils.ProjectErrorType>(
  body: () => PromiseLike<T>,
  ...additionalCauses: Sirutils.ErrorValues[]
): Promise<T> => {
  try {
    return await body()
  } catch (e) {
    if (e instanceof ProjectError) {
      throw e.appendData([e]).appendCause(...additionalCauses) as unknown as Err<T, E>
    }

    throw ProjectError.create(coreTags.forward, `${e}`)
      .appendCause(...additionalCauses)
      .appendData([e]) as unknown as Err<T, E>
  }
}

export const forwardEither = <T, E extends Sirutils.ProjectErrorType>(
  body: () => T,
  ...additionalCauses: Sirutils.ErrorValues[]
): T extends PromiseLike<infer R> ? Promise<R> : T => {
  try {
    const result = body()

    if (result && typeof result === 'object' && (result as BlobType).then) {
      return result as BlobType
    }

    return result as BlobType
  } catch (e) {
    if (e instanceof ProjectError) {
      throw e.appendData([e]).appendCause(...additionalCauses) as unknown as Err<T, E>
    }

    throw ProjectError.create(coreTags.forward, `${e}`)
      .appendCause(...additionalCauses)
      .appendData([e]) as unknown as Err<T, E>
  }
}
