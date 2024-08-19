import { ProjectError, capsule } from '@sirutils/core'
import { safeToolboxTags } from '../tag'

/**
 * Makes an array unique (doesn't mutate)
 */
export const unique = <T>(data: T[]) => [...new Set(data)]

/**
 * Get unique keys from an object
 */
export const objectKeys = <T extends object>(object: T): Set<keyof T> => {
  return new Set(Object.keys(object)) as Set<keyof T>
}

/**
 * Checks if provided Set's are equal
 */
export const areSetsEqual = <T>(set1: Set<T>, set2: Set<T>) => {
  return set1.symmetricDifference(set2).size === 0
}

/**
 * Removes all properties with undefined values from an object, returning a new object of the same type.
 */
export const filterUndefinedFromObject = <T, U extends ValueRecord<T>>(object: U): U => {
  return Object.fromEntries(Object.entries(object).filter(([_, v]) => v !== undefined)) as U
}

/**
 * Extracts the keys shared by all objects in a given array, ensuring that all objects have identical keys, and throws an error if the array is empty or if the keys differ between objects.
 */
export const extractKeys = capsule(<T, U extends ValueRecord<T>>(objects: U[]): (keyof U)[] => {
  if (objects.length === 0) {
    return ProjectError.create(
      safeToolboxTags.emptyList,
      'Cannot call extractKeys on empty list'
    ).throw()
  }

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const keys = objectKeys(objects[0]!)

  for (const o of objects) {
    const oKeys = objectKeys(o)
    if (!areSetsEqual(keys, oKeys)) {
      return ProjectError.create(
        safeToolboxTags.differentKeys,
        `Objects have different keys: ${JSON.stringify(objects)}`
      ).throw()
    }
  }

  return Array.from(keys)
}, safeToolboxTags.extractKeys)

export type ValueRecord<T = unknown> = Record<string | number | symbol, T>
