export const BUILDER = Symbol('BUILDER')
export const GENERATED = Symbol('Generated Query')
export const EMPTY = Symbol('EMPTY')
export const OBJECT = Symbol('OBJECT')

export const AND = Symbol('AND')
export const OR = Symbol('OR')
export const INCLUDES = Symbol('INCLUDES')

export const GT = Symbol('GT')
export const GTE = Symbol('GTE')
export const LT = Symbol('LT')
export const LTE = Symbol('LTE')

export const UPDATE = Symbol('UPDATE')
export const INSERT = Symbol('INSERT')

export const CACHEABLE_COMPARISON_OPERATIONS: symbol[] = [GT, GTE, LT, LTE]
export const CACHEABLE_OPERATIONS: symbol[] = [
  AND,
  OR,
  INCLUDES,
  ...CACHEABLE_COMPARISON_OPERATIONS,
]

export const createDefaultCacheValue = (): Sirutils.Seql.QueryBuilder['cache'] => ({
  entry: null,
  columns: null,
  tableName: null,
})
