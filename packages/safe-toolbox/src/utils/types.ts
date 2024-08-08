import type { BlobType } from '@sirutils/core'

export const isRawObject = (value: unknown): value is object =>
  typeof value === 'object' && !Array.isArray(value) && value !== null && !(value instanceof Date)

export const isPromise = (value: unknown): value is PromiseLike<BlobType> => {
  return typeof value === 'object' && typeof (value as BlobType)?.then === 'function'
}

export const isFunction = (value: unknown): value is (...args: BlobType[]) => BlobType => {
  return !!value && {}.toString.call(value) === '[object Function]'
}
