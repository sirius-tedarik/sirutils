import type { BlobType } from '../../shared'

export class ProjectError extends Error {
  constructor(
    // biome-ignore lint/nursery/useConsistentMemberAccessibility: Redundant
    public name: Std.ErrorValues,
    // biome-ignore lint/nursery/useConsistentMemberAccessibility: Redundant
    public message: string,
    // biome-ignore lint/nursery/useConsistentMemberAccessibility: Redundant
    public cause: Std.ErrorValues[] = [],
    // biome-ignore lint/nursery/useConsistentMemberAccessibility: Redundant
    public data: BlobType[] = [],
    // biome-ignore lint/nursery/useConsistentMemberAccessibility: Redundant
    public timestamp: number = Date.now()
  ) {
    super()
  }

  /**
   * append cause to error (checks last cause if its already appended)
   */
  appendCause(...additionalCauses: (Std.ErrorValues | undefined)[]) {
    for (const additionalCause of additionalCauses) {
      if (additionalCause && this.cause[this.cause.length - 1] !== additionalCause) {
        this.cause.push(additionalCause)
      }
    }

    return this
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
  throw(...additionalCauses: (Std.ErrorValues | undefined)[]): never {
    throw this.appendCause.apply(this, additionalCauses)
  }

  static create = (name: Std.ErrorValues, message: string) => {
    return new ProjectError(name, message)
  }
}
