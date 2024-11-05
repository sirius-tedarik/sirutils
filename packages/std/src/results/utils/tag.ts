import type { BlobType, LiteralUnion } from '../../shared'

import { err } from './err'

export class Tags<U extends [string, string], T extends string> {
  tags = new Map<string, string>()

  constructor(protected base: T) {}

  add<K extends string, V extends string = never>(key: K, value?: V) {
    const tag = `${this.base}.${value ?? key}`

    if (!this.tags.get(key)) {
      this.tags.set(key, tag)
    }

    return this as Tags<U | [K, V], T>
  }

  get<K extends LiteralUnion<U['0'], `?${string}`>>(key: K) {
    const found = this.tags.get(key)

    if (!found) {
      return err('std/results.unexpected', `${key} cannot found in: ${this.base} tags`)
        .appendCause('std/results.tags#get')
        .throw()
    }

    type R = Extract<U, [K, BlobType]>['1']

    return found as R extends never ? `${T}.${K}` : `${T}.${R}`
  }

  has<const K extends string>(
    key: K
  ): K extends Std.ExtractErrors<Tags<U, T>> ? true : K extends U['0'] ? true : false {
    const found = this.tags.get(key) ?? this.tags.values().find(tag => tag.includes(key))

    return !!found as BlobType
  }

  static create<T extends string>(base: T) {
    return new Tags<never, T>(base)
  }
}
