import { filterUndefinedFromObject } from '@sirutils/safe-toolbox'

import { buildAll, isBuilder, join, raw, safe } from './builder'
import { AND, INCLUDES, OR } from './consts'
import { isGenerated } from './generator'

/**
 * Object to chained AND (use after WHERE)
 */
export const and = <T>(
  adapterApi: Sirutils.Seql.AdapterApi,
  records: (Sirutils.Seql.ValueRecord | Sirutils.Seql.QueryBuilder)[],
  include: string[] | true = true
): Sirutils.Seql.QueryBuilder<T> => {
  const cacheNames: string[] = []
  const isAllIncluded = typeof include === 'boolean' && include

  const chain = records.flatMap(record => {
    if (isBuilder(record)) {
      if (record.cache.entry) {
        cacheNames.push(record.cache.entry)
      }
      return record
    }
    if (isGenerated(record)) {
      return record.builder
    }

    const columnValues = Object.entries(filterUndefinedFromObject(record))

    return columnValues.map(([columnName, columnValue]) => {
      if (isBuilder(columnValue)) {
        if ((isAllIncluded || include.includes(columnName)) && columnValue.cache.entry) {
          cacheNames.push(`${columnName}:${columnValue.cache.entry}`)
        }

        return buildAll`${raw(adapterApi, columnName)} ${columnValue}`(adapterApi)
      }

      if (isAllIncluded || include.includes(columnName)) {
        cacheNames.push(`${columnName}:${columnValue}`)
      }

      return buildAll`${raw(adapterApi, columnName)} = ${safe(adapterApi, columnValue, columnName)}`(
        adapterApi
      )
    })
  })

  const andChain = join(chain, ' AND ')
  const result = buildAll`(${andChain})`(adapterApi)

  result.cache.entry = `and(${cacheNames.join(',')})`
  result.operations.push(AND)

  return result
}

/**
 * Object to chained OR (use after WHERE)
 */
export const or = <T>(
  adapterApi: Sirutils.Seql.AdapterApi,
  records: (Sirutils.Seql.ValueRecord | Sirutils.Seql.QueryBuilder)[]
): Sirutils.Seql.QueryBuilder<T> => {
  if (records.length === 0) {
    return raw(adapterApi, '')
  }

  const cacheNames: string[] = []

  const andChainBuilders = records.map(record => {
    if (isBuilder(record)) {
      if (record.cache.entry) {
        cacheNames.push(record.cache.entry)
      }

      return record
    }

    if (isGenerated(record)) {
      if (record.builder.cache.entry) {
        cacheNames.push(record.builder.cache.entry)
      }

      return record.builder
    }

    const andResult = and(adapterApi, [record], true)

    if (andResult.cache.entry) {
      cacheNames.push(andResult.cache.entry)
    }

    return andResult
  })

  const andChain = join(andChainBuilders, ' OR ')
  const result = buildAll`(${andChain})`(adapterApi)

  if (cacheNames.length === 1) {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    result.cache.entry = cacheNames[0]!
  } else if (cacheNames.length > 1) {
    result.cache.entry = `or(${cacheNames.join(',')})`
  }

  result.operations.push(OR)

  return result
}

export const includes = <T>(
  adapterApi: Sirutils.Seql.AdapterApi,
  values: string[],
  not = false
): Sirutils.Seql.QueryBuilder<T> => {
  if (values.length === 0) {
    return raw(adapterApi, '')
  }

  const safeBuilders = values.map(value => safe(adapterApi, value))
  const joinedSafes = join(safeBuilders, ',')
  const result = buildAll`${raw(adapterApi, not ? 'NOT IN' : 'IN')} (${joinedSafes})`(adapterApi)

  result.cache.entry = `in(${values.join(',')})`

  result.operations.push(INCLUDES)

  return result
}
