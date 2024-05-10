import type { BlobType } from '@sirutils/core'

import { isGenerated, join } from './builder'

export const escapeIdentifier = (identifier: string) => {
  let result = identifier

  if (result.charAt(0) === '"' && result.charAt(result.length - 1) === '"') {
    result = result.slice(1, result.length - 2)
  }
  if (result.includes('"')) {
    throw new Error(`Invalid identifier: ${result}`)
  }
  return `"${result}"`
}

export const filterUndefined = <Value = BlobType>(
  object: Sirutils.Seql.ValueRecord<Value>
): Sirutils.Seql.ValueRecord<Value> => {
  const filteredEntries = Object.entries(object).filter(([_, v]) => v !== undefined)

  return Object.fromEntries(filteredEntries)
}

export const mergeLists = <T>(list1: readonly T[], list2: readonly T[]): T[] => {
  const result: T[] = []

  for (let i = 0; i < Math.max(list1.length, list2.length); i++) {
    const elem1 = list1[i]
    if (elem1 !== undefined) {
      result.push(elem1)
    }

    const elem2 = list2[i]
    if (elem2 !== undefined) {
      const generated = (elem2 as BlobType).values
        .filter((value: BlobType) => isGenerated(value))
        .map((value: BlobType) => value.builder) as BlobType
      ;(elem2 as BlobType).values = (elem2 as BlobType).values.filter(
        (value: BlobType) => !isGenerated(value)
      )

      if (generated.length > 0) {
        result.push(join(generated) as T)
      } else {
        result.push(elem2)
      }
    }
  }

  return result
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

const objectKeys = (object: object): Set<string> => {
  return new Set(Object.keys(object))
}

export const extractKeys = <Value = BlobType>(
  objects: Sirutils.Seql.ValueRecord<Value>[]
): string[] => {
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
