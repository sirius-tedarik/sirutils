export const unique = <T>(data: T[]) => [...new Set(data)]

export const objectKeys = <T extends object>(object: T): Set<keyof T> => {
  return new Set(Object.keys(object)) as Set<keyof T>
}

export const areSetsEqual = <T>(set1: Set<T>, set2: Set<T>) => {
  return set1.symmetricDifference(set2).size === 0
}

export const filterUndefinedFromObject = <T, U extends ValueRecord<T>>(object: U): U => {
  return Object.fromEntries(Object.entries(object).filter(([_, v]) => v !== undefined)) as U
}

export const extractKeys = <T, U extends ValueRecord<T>>(objects: U[]): (keyof U)[] => {
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

export type ValueRecord<T = unknown> = Record<string | number | symbol, T>
