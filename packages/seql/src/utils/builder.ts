import type { BlobType } from '@sirutils/core'

import { selectedAdapter } from '../internal/adapters'
import { BUILDER, CACHEABLE_OPERATIONS } from '../internal/consts'
import { logger } from '../internal/logger'
import { isObject, unique } from '../internal/utils'
import { seqlTags } from '../tag'
import { generateCacheKey, isGenerated } from './generator'

/**
 * Base builder all other builds have to rely on this!
 */
const builder = <T = BlobType>(
  entries: Sirutils.Seql.QueryBuilder<T>['entries'],
  buildText: Sirutils.Seql.QueryBuilder<T>['buildText'],
  cacheKeys: string[] = [],
  operations: symbol[] = []
): Sirutils.Seql.QueryBuilder<T> => {
  const result = {
    $type: BUILDER,
    entries,
    buildText,
    cacheKeys,
    operations,
  }

  if (operations.some(operation => !CACHEABLE_OPERATIONS.includes(operation))) {
    logger.warn(
      `[${seqlTags.cacheEvicted}]: for cache: ${generateCacheKey(result)} based on operations:`,
      unique(operations)
    )

    result.cacheKeys = []
  }

  return result
}

/**
 * Use for query (dangerous!). use this function carefully
 */
export const raw = (value: string) => {
  return builder([], () => value)
}

/**
 * Use for parameters when you need more control (than operations) over queries.
 */
export const safe = <T>(value: T, key: string | null = null, include: true | string[] = true) => {
  return builder(
    isObject(value)
      ? Object.entries(value).map(([targetKey, targetValue]) => [
          targetKey,
          targetValue,
          Array.isArray(include) ? (key ? include.includes(key) : false) : include,
        ])
      : [[key, value, Array.isArray(include) ? (key ? include.includes(key) : false) : include]],
    nextParamID => selectedAdapter.parameterPattern(nextParamID.toString())
  )
}

/**
 * Check is builder
 */
export const isBuilder = (builder: BlobType): builder is Sirutils.Seql.QueryBuilder => {
  return builder && builder.$type === BUILDER
}

/**
 * Check if provided value is a BuildedQuery if its not convert to it with safe
 */
export const toSqlBuilder = <T>(
  value: Sirutils.Seql.QueryBuilder<T> | T
): Sirutils.Seql.QueryBuilder<T> => {
  return isBuilder(value) ? value : safe(value)
}

/**
 * Join multiple builders (only builders not generateds)
 */
export const join = <T>(
  builders: Sirutils.Seql.QueryBuilder<T>[],
  delimiter = ''
): Sirutils.Seql.QueryBuilder<T> => {
  const { entries, cacheKeys, operations } = builders.reduce(
    (acc, { entries, cacheKeys, operations }) => {
      if (entries.length > 0) {
        acc.entries.push(...entries)
      }

      if (cacheKeys.length > 0) {
        acc.cacheKeys.push(...cacheKeys)
      }

      if (operations.length > 0) {
        acc.operations.push(...operations)
      }

      return acc
    },
    {
      entries: [],
      cacheKeys: [],
      operations: [],
    } as {
      entries: Sirutils.Seql.QueryBuilder<T>['entries']
      cacheKeys: Sirutils.Seql.QueryBuilder<T>['cacheKeys']
      operations: Sirutils.Seql.QueryBuilder<T>['operations']
    }
  )

  return builder(
    entries,
    nextParamID => {
      let paramID = nextParamID
      const builtText: string[] = []

      for (const builder of builders) {
        builtText.push(builder.buildText(paramID))
        paramID += builder.entries.length
      }

      return builtText.join(delimiter)
    },
    cacheKeys,
    unique(operations)
  )
}

/**
 * Merge builders or generators (only for template string tags)
 */
export const mergeLists = <T>(list1: readonly T[], list2: readonly T[]): T[] => {
  const result: T[] = []

  for (let i = 0; i < Math.max(list1.length, list2.length); i++) {
    const elem1 = list1[i]
    if (elem1 !== undefined) {
      result.push(elem1)
    }

    const elem2 = list2[i]
    if (elem2 !== undefined) {
      const generated = (elem2 as BlobType).entries
        .filter(([, value]: BlobType) => isGenerated(value))
        .map(([, value]: BlobType) => value.builder) as BlobType
      ;(elem2 as BlobType).entries = (elem2 as BlobType).entries.filter(
        ([, value]: BlobType) => !isGenerated(value)
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

/**
 * Internal template string tag that builds all props.
 */
export const buildAll = (
  texts: TemplateStringsArray,
  ...values: BlobType[]
): Sirutils.Seql.QueryBuilder => {
  const textSqlBuilders = texts.map(raw)
  const valueSqlBuilders = values.map(toSqlBuilder)

  const sqlBuilders = mergeLists(textSqlBuilders, valueSqlBuilders)

  return join(sqlBuilders)
}
