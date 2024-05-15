import type { BlobType } from '@sirutils/core'

export const isObject = (value: BlobType): value is object =>
  typeof value === 'object' && !Array.isArray(value) && value !== null && !(value instanceof Date)

export const unique = (data: BlobType[]) => [...new Set(data)]

const objectKeys = (object: object): Set<string> => {
  return new Set(Object.keys(object))
}

const areSetsEqual = <T>(set1: Set<T>, set2: Set<T>): boolean => {
  const difference = new Set(set1)
  for (const elem of set2) {
    if (difference.has(elem)) {
      difference.delete(elem)
    } else {
      return false
    }
  }

  return difference.size === 0
}

export const filterUndefined = <T extends Sirutils.Seql.ValueRecord>(object: T): T => {
  return Object.fromEntries(Object.entries(object).filter(([_, v]) => v !== undefined)) as T
}

export const extractKeys = <T extends Sirutils.Seql.ValueRecord>(objects: T[]): string[] => {
  if (objects.length === 0) {
    throw new Error('Cannot call extractKeys on empty list')
  }

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const keys = objectKeys(objects[0]!)

  for (const o of objects) {
    const oKeys = objectKeys(o)
    if (!areSetsEqual(keys, oKeys)) {
      throw new Error(`Objects have different keys: ${JSON.stringify(objects)}`)
    }
  }

  return Array.from(keys)
}
