import type { BlobType } from '@sirutils/core'
import { isRawObject, unique } from '@sirutils/safe-toolbox'

import { BUILDER, EMPTY, createDefaultCacheValue } from './consts'
import { isGenerated } from './generator'

/**
 * Base builder all other builds have to rely on this!
 */
export const builder = <T = BlobType>(
  queryBuilder: Partial<Exclude<Sirutils.Seql.QueryBuilder<T>, 'buildText'>> &
    Pick<Sirutils.Seql.QueryBuilder<T>, 'buildText'>
): Sirutils.Seql.QueryBuilder<T> => {
  // set defaults
  Object.assign(queryBuilder, {
    tableName: null,
    entries: [],
    cache: createDefaultCacheValue(),
    operations: [],

    ...queryBuilder,
  })

  queryBuilder.$type = BUILDER

  return queryBuilder as Sirutils.Seql.QueryBuilder<T>
}

/**
 * Check is builder
 */
export const isBuilder = (builder: BlobType): builder is Sirutils.Seql.QueryBuilder => {
  return builder && builder.$type === BUILDER
}

/**
 * Join multiple builders (only builders not generateds)
 */
export const join = <T>(
  builders: Sirutils.Seql.QueryBuilder<T>[],
  delimiter = ''
): Sirutils.Seql.QueryBuilder<T> => {
  const { entries, cache, operations } = builders.reduce(
    (acc, { entries, cache, operations }) => {
      if (entries.length > 0) {
        acc.entries.push(...entries)
      }

      const cacheEntries = Object.entries(cache)

      if (cacheEntries.length > 0) {
        for (const [key, value] of cacheEntries) {
          if (value) {
            acc.cache[key] = value
          }
        }
      }

      if (operations.length > 0) {
        acc.operations.push(...operations)
      }

      return acc
    },
    {
      entries: [],
      cache: createDefaultCacheValue(),
      operations: [],
    } as {
      entries: Sirutils.Seql.QueryBuilder<T>['entries']
      cache: Sirutils.Seql.QueryBuilder<T>['cache']
      operations: Sirutils.Seql.QueryBuilder<T>['operations']
    }
  )

  return builder({
    entries,
    buildText: nextParamID => {
      let paramID = nextParamID
      const builtText: string[] = []

      for (const builder of builders) {
        builtText.push(builder.buildText(paramID))
        paramID += builder.entries.length
      }

      return builtText.join(delimiter)
    },
    cache,
    operations: unique(operations),
  })
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
      const generated = (elem2 as BlobType).entries.reduce((acc: BlobType[], curr: BlobType) => {
        if (isGenerated(curr.value)) {
          acc.push(curr.value.builder)
        }

        return acc
      }, [] as BlobType[])

      // const generated = (elem2 as BlobType).entries
      //   .filter((entry: BlobType) => isGenerated(entry.value))
      //   .map((entry: BlobType) => entry.value.builder) as BlobType
      ;(elem2 as BlobType).entries = (elem2 as BlobType).entries.filter(
        (entry: BlobType) => !isGenerated(entry.value)
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
 * Use for query (dangerous!). use this function carefully
 */
export const raw = (adapterApi: Sirutils.Seql.AdapterApi, value: string, key?: string) => {
  if (key) {
    return builder({
      entries: [
        {
          key,
          value: EMPTY,
        },
      ],
      buildText: () => adapterApi.handleRaw(value),
    })
  }

  return builder({
    buildText: () => adapterApi.handleRaw(value),
  })
}

/**
 * Use for parameters when you need more control (than operations) over queries.
 */
export const safe = <T>(adapterApi: Sirutils.Seql.AdapterApi, value: T, key?: string) => {
  return builder({
    buildText: nextParamID => adapterApi.parameterPattern(nextParamID.toString()),
    entries: isRawObject(value)
      ? Object.entries(value).map(([targetKey, targetValue]) => ({
          key: targetKey,
          value: adapterApi.transformData(targetValue),
        }))
      : [{ key, value: adapterApi.transformData(value) }],
  })
}

/**
 * Use for query with caches (dangerous!). use this function carefully
 */
export const extra = (
  adapterApi: Sirutils.Seql.AdapterApi,
  cacheName: string,
  value: string,
  key?: string,
  isSafe = true
) => {
  const result = isSafe ? safe(adapterApi, value, key) : raw(adapterApi, value, key)

  result.cache[cacheName] = value

  return result
}

/**
 * Check if provided value is a BuildedQuery if its not convert to it with safe
 */
export const toSqlBuilder = <T>(
  adapterApi: Sirutils.Seql.AdapterApi,
  value: Sirutils.Seql.QueryBuilder<T> | T,
  key?: string
): Sirutils.Seql.QueryBuilder<T> => {
  if (isBuilder(value)) {
    if (value.entries[0] && value.entries[0]?.key === null) {
      value.entries[0].key = key
    }

    return value
  }

  return safe(adapterApi, value, key)
}

/**
 * Internal template string tag that builds all props.
 */
export const buildAll = (texts: TemplateStringsArray, ...values: BlobType[]) => {
  return (adapterApi: Sirutils.Seql.AdapterApi): Sirutils.Seql.QueryBuilder => {
    const textSqlBuilders = texts.map(text => raw(adapterApi, text))
    const valueSqlBuilders = values.map(value => toSqlBuilder(adapterApi, value))

    const sqlBuilders = mergeLists(textSqlBuilders, valueSqlBuilders)

    return join(sqlBuilders)
  }
}
