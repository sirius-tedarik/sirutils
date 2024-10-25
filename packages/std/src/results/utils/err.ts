import { ProjectError } from '../../errors'
import type { BlobType } from '../../shared'

import type { Ok } from './ok'

export class Err<T, E extends Std.ProjectErrorType>
  extends ProjectError
  implements Std.ResultType<T, E>
{
  constructor(
    name: Std.ErrorValues,
    message: string,
    cause: Std.ErrorValues[] = [],
    data: BlobType[] = [],
    timestamp: number = Date.now()
  ) {
    super(name, message, cause, data, timestamp)
  }

  isOk(): this is Ok<T, E> {
    return false
  }

  isErr(): this is Err<T, E> {
    return !this.isOk()
  }

  unwrap(): never {
    return this.throw()
  }

  *[Symbol.iterator](): Generator<Err<never, E>, T> {
    // biome-ignore lint/complexity/noUselessThisAlias: Redundant
    const self = this
    // @ts-expect-error -- This is structurally equivalent and safe
    yield self
    // @ts-expect-error -- This is structurally equivalent and safe
    return self
  }
}

export function err<T = never, E extends Std.ProjectErrorType = Std.ProjectErrorType>(
  name: Std.ErrorValues,
  message: string
): Err<T, E>
export function err<T = never, E extends Std.ProjectErrorType = Std.ProjectErrorType>(
  name: Std.ErrorValues,
  message: string
): Err<T, E> {
  return new Err(name, message)
}
