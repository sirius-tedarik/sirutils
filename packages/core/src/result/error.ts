import { type Result, type ResultAsync, err, ok } from 'neverthrow'

import { coreTags } from '../tag'
import { type BlobType, getCircularReplacer } from '../utils/common'

export class ProjectError extends Error {
  constructor(
    public name: Sirutils.ErrorValues,
    public message: string,
    public cause: Sirutils.ErrorValues[] = [],
    public data: BlobType[] = [],
    public timestamp: number = Date.now()
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
   * append data to error (checks if its already appended)
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
  throw(...additionalCauses: (Sirutils.ErrorValues | undefined)[]): never {
    throw this.appendCause(...additionalCauses)
  }

  stringify() {
    return JSON.stringify(
      {
        ...this,
        data: this.data,
      },
      getCircularReplacer(),
      2
    )
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

const isPromise = (value: unknown): value is PromiseLike<BlobType> => {
  return typeof value === 'object' && typeof (value as BlobType)?.then === 'function'
}

export const unwrap = <T>(
  result: Result<T, Sirutils.ProjectErrorType>,
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

const handleGroupCatch = (e: BlobType, ...additionalCauses: Sirutils.ErrorValues[]) => {
  if (e instanceof ProjectError) {
    return e.appendCause(...additionalCauses)
  }

  return ProjectError.create(coreTags.group, `${e}`)
    .appendCause(...additionalCauses)
    .appendData([e])
}

export const group = <T>(
  body: () => T,
  ...additionalCauses: Sirutils.ErrorValues[]
): T extends PromiseLike<BlobType>
  ? ResultAsync<Awaited<T>, Sirutils.ProjectErrorType>
  : Result<T, Sirutils.ProjectErrorType> => {
  try {
    const response = body() as BlobType

    if (isPromise(response)) {
      return response.then(
        data => ok(data),
        e => handleGroupCatch(e, ...additionalCauses).asResult()
      ) as BlobType
    }

    return ok(response) as BlobType
  } catch (e) {
    return handleGroupCatch(e, ...additionalCauses).asResult() as BlobType
  }
}

const handleWrapCatch = (e: BlobType, ...additionalCauses: Sirutils.ErrorValues[]) => {
  if (e instanceof ProjectError) {
    return e.appendCause(...additionalCauses)
  }

  return ProjectError.create(coreTags.wrap, `${e}`)
    .appendCause(...additionalCauses)
    .appendData([e])
}

export const wrap = <A extends BlobType[], T>(
  body: (...args: A) => T,
  ...additionalCauses: Sirutils.ErrorValues[]
) => {
  return (
    ...args: A
  ): T extends PromiseLike<BlobType>
    ? ResultAsync<Awaited<T>, Sirutils.ProjectErrorType>
    : Result<T, Sirutils.ProjectErrorType> => {
    try {
      const response = body(...args) as BlobType

      if (isPromise(response)) {
        return response.then(
          data => ok(data),
          e => handleWrapCatch(e, ...additionalCauses).asResult()
        ) as BlobType
      }

      return ok(response) as BlobType
    } catch (e) {
      return handleWrapCatch(e, ...additionalCauses).asResult() as BlobType
    }
  }
}

const handleForwardCatch = (e: BlobType, ...additionalCauses: Sirutils.ErrorValues[]) => {
  if (e instanceof ProjectError) {
    throw e.appendCause(...additionalCauses)
  }

  const isCapsule = additionalCauses[0] === coreTags.capsule

  const projectError = ProjectError.create(isCapsule ? coreTags.capsule : coreTags.forward, `${e}`)
    .appendCause(...(isCapsule ? additionalCauses.slice(1) : additionalCauses))
    .appendData([e])

  return projectError
}

export const forward = <T>(body: () => T, ...additionalCauses: Sirutils.ErrorValues[]): T => {
  try {
    const response = body() as BlobType

    if (isPromise(response)) {
      const { promise, reject, resolve } = Promise.withResolvers()

      response.then(resolve, e => {
        reject(handleForwardCatch(e, ...additionalCauses))
      })

      return promise as T
    }

    return response as T
  } catch (e) {
    throw handleForwardCatch(e, ...additionalCauses)
  }
}

export const capsule = <A extends BlobType[], T, R extends (...args: A) => T>(
  body: R,
  ...additionalCauses: Sirutils.ErrorValues[]
): R => {
  return ((...args: A) =>
    forward(() => body(...args), coreTags.capsule, ...additionalCauses)) as BlobType
}
