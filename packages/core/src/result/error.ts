import { type Result, type ResultAsync, err, ok } from 'neverthrow'

import { coreTags } from '../tag'
import { type BlobType, getCircularReplacer } from '../utils/common'
import { Lazy } from '../utils/lazy'

/**
 * The ProjectError class extends the native Error object to provide structured error handling,
 * including the ability to append additional causes and data to the error.
 * The static create method simplifies the instantiation of ProjectError.
 */
export class ProjectError extends Error {
  constructor(
    // biome-ignore lint/nursery/useConsistentMemberAccessibility: Redundant
    public name: Sirutils.ErrorValues,
    // biome-ignore lint/nursery/useConsistentMemberAccessibility: Redundant
    public message: string,
    // biome-ignore lint/nursery/useConsistentMemberAccessibility: Redundant
    public cause: Sirutils.ErrorValues[] = [],
    // biome-ignore lint/nursery/useConsistentMemberAccessibility: Redundant
    public data: BlobType[] = [],
    // biome-ignore lint/nursery/useConsistentMemberAccessibility: Redundant
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
    return err(this.appendCause.apply(this, additionalCauses))
  }

  /**
   * append data to error (checks if its already appended)
   */
  appendData(...datas: BlobType[]) {
    for (const data of datas) {
      if (!this.data.includes(data)) {
        this.data.push(data)
      }
    }

    return this
  }

  /**
   * throws without using unwrap
   */
  throw(...additionalCauses: (Sirutils.ErrorValues | undefined)[]): never {
    throw this.appendCause.apply(this, additionalCauses)
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

/**
 * Safely extracts the value from a Result, throwing the associated ProjectError if the result is an error, with optional additional causes.
 */
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
    .appendData(e)
}

/**
 * Executes a synchronous or asynchronous function within a try-catch block, returning a Result or ResultAsync based on the outcome, and appends causes to any caught errors.
 */
export const group = <T>(
  body: () => T,
  ...additionalCauses: Sirutils.ErrorValues[]
): T extends PromiseLike<BlobType>
  ? ResultAsync<Awaited<T>, Sirutils.ProjectErrorType>
  : Result<T, Sirutils.ProjectErrorType> => {
  try {
    const response = body() as BlobType

    if (response instanceof Lazy) {
      return ok(response.appendCause(...additionalCauses)) as BlobType
    }

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
    .appendData(e)
}

/**
 * Wraps a function with error handling, returning a Result or ResultAsync depending on whether the function is synchronous or asynchronous, and appends additional causes to any caught errors.
 */
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

      if (response instanceof Lazy) {
        return ok(response.appendCause(...additionalCauses)) as BlobType
      }

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

  if (isCapsule) {
    additionalCauses.shift()
  }

  const projectError = ProjectError.create(isCapsule ? coreTags.capsule : coreTags.forward, `${e}`)
    .appendCause(...additionalCauses)
    .appendData(e)

  return projectError
}

/**
 * Executes a function and rethrows any caught errors, appending additional causes if provided, while ensuring proper error forwarding in both synchronous and asynchronous contexts.
 */
export const forward = <T>(body: () => T, ...additionalCauses: Sirutils.ErrorValues[]): T => {
  try {
    const response = body() as BlobType

    if (response instanceof Lazy) {
      return response.appendCause(...additionalCauses) as T
    }

    if (isPromise(response)) {
      return response.then(
        data => data,
        e => handleForwardCatch(e, ...additionalCauses).throw()
      ) as T
    }

    return response as T
  } catch (e) {
    throw handleForwardCatch(e, ...additionalCauses)
  }
}

/**
 * Encapsulates a function within an error-forwarding wrapper, ensuring that any errors are properly handled and forwarded with the coreTags.capsule cause included.
 */
export const capsule = <A extends BlobType[], T, R extends (...args: A) => T>(
  body: R,
  ...additionalCauses: Sirutils.ErrorValues[]
): R => {
  return ((...args: A) =>
    forward(() => body(...args), coreTags.capsule, ...additionalCauses)) as BlobType
}
