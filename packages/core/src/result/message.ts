import { ok } from 'neverthrow'

import type { BlobType } from '../utils/common'

/**
 * The ProjectMessage class represents structured messages with a name, message content, and optional data, providing a method to convert the message into a successful Result.
 */
export class ProjectMessage {
  constructor(
    public name: Sirutils.Message[keyof Sirutils.Message],
    public message: string,
    public data?: BlobType
  ) {}

  asResult() {
    return ok(this)
  }

  static create(name: Sirutils.Message[keyof Sirutils.Message], message: string, data?: BlobType) {
    return new ProjectMessage(name, message, data)
  }
}
