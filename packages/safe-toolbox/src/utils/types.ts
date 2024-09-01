import type { BlobType } from '@sirutils/core'

export const getType = (value: unknown): string => {
  return {}.toString.call(value).slice(8, -1).toLowerCase()
}

/**
 * Checks if value is an object
 */
export const isRawObject = (value: unknown): value is object =>
  typeof value === 'object' && !Array.isArray(value) && value !== null && !(value instanceof Date)

/**
 * Checks if value is an promise
 */
export const isPromise = (value: unknown): value is PromiseLike<BlobType> => {
  return typeof value === 'object' && typeof (value as BlobType)?.then === 'function'
}

/**
 * Checks if value is an function
 */
export const isFunction = (value: unknown): value is (...args: BlobType[]) => BlobType => {
  return !!value && {}.toString.call(value) === '[object Function]'
}
