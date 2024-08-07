export const BUILDER = Symbol('BUILDER')
export const GENERATED = Symbol('Generated Query')
export const EMPTY = Symbol('EMPTY')

export const AND = Symbol('AND')
export const OR = Symbol('OR')
export const INCLUDES = Symbol('INCLUDES')

export const CACHEABLE_OPERATIONS: symbol[] = [AND, OR, INCLUDES]

export const createDefaultCacheValue = (): Sirutils.Seql.QueryBuilder['cache'] => ({
  entry: null,
})
