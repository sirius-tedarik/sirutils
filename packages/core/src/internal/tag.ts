const TAG = '@sirutils/core' as const

export const createTag = <const T>(str: T) => `${TAG}.${str}` as TagMapper<T>

export type TagMapper<T> = T extends string ? `${typeof TAG}.${T}` : null
