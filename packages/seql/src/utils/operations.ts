import { ProjectError } from '@sirutils/core'
import { type ValueRecord, filterUndefinedFromObject } from '@sirutils/safe-toolbox'

import { seqlTags } from '../tag'
import { buildAll, isBuilder, join, raw, safe } from './builder'
import { comparisonToSymbol, symbolToOperation } from './common'
import { AND, CACHEABLE_COMPARISON_OPERATIONS, INCLUDES, INSERT, LIMIT, OR, UPDATE } from './consts'
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

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Redundant
    return columnValues.map(([columnName, columnValue]) => {
      if (isBuilder(columnValue)) {
        if (
          columnValue.$subtype &&
          CACHEABLE_COMPARISON_OPERATIONS.includes(columnValue.$subtype)
        ) {
          const op = symbolToOperation(columnValue.$subtype)

          if (op) {
            if (isAllIncluded || include.includes(columnName)) {
              cacheNames.push(`${columnName}${op}${columnValue.entries[0]?.value}`)
            }

            return buildAll`${raw(adapterApi, columnName)} ${raw(adapterApi, op)} ${columnValue}`(
              adapterApi
            )
          }
        }

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
  const result =
    buildAll`${raw(adapterApi, adapterApi.andGrouping ? '(' : '')}${andChain}${raw(adapterApi, adapterApi.andGrouping ? ')' : '')}`(
      adapterApi
    )

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
  const result =
    buildAll`${raw(adapterApi, adapterApi.andGrouping ? '(' : '')}}${andChain}${raw(adapterApi, adapterApi.andGrouping ? ')' : '')}}`(
      adapterApi
    )

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

export const update = <T extends ValueRecord>(
  adapterApi: Sirutils.Seql.AdapterApi,
  tableName: string,
  record: T
): Sirutils.Seql.QueryBuilder<T> => {
  const chain = Object.entries(record).map(([key, value]) =>
    buildAll`${raw(adapterApi, key)} = ${safe(adapterApi, value, key)}`(adapterApi)
  )

  const result = buildAll`UPDATE ${raw(adapterApi, tableName)} SET ${join(chain, ', ')}`(adapterApi)

  result.cache.tableName = tableName
  result.operations.push(UPDATE)

  return result
}

export const insert = <T extends ValueRecord>(
  adapterApi: Sirutils.Seql.AdapterApi,
  tableName: string,
  record: T
): Sirutils.Seql.QueryBuilder<T> => {
  const keyChain = Object.keys(record).map(key => buildAll`${raw(adapterApi, key)}`(adapterApi))
  const valueChain = Object.entries(record).map(([key, value]) =>
    buildAll`${safe(adapterApi, value, key)}`(adapterApi)
  )

  const result =
    buildAll`INSERT INTO ${raw(adapterApi, tableName)} (${join(keyChain, ', ')}) VALUES (${join(valueChain, ', ')})`(
      adapterApi
    )

  result.cache.tableName = tableName
  result.operations.push(INSERT)

  return result
}

export const comparison = <T>(
  adapterApi: Sirutils.Seql.AdapterApi,
  value: T,
  operation: Parameters<typeof comparisonToSymbol>[0],
  key?: string
): Sirutils.Seql.QueryBuilder<T> => {
  const result = safe(adapterApi, value, key)
  const sym = comparisonToSymbol(operation)

  if (!sym) {
    return ProjectError.create(seqlTags.invalidComparison, `${operation} is invalid`).throw()
  }

  result.operations.push(AND)
  result.$subtype = sym

  return result
}

export const limit = (
  adapterApi: Sirutils.Seql.AdapterApi,
  value: number
): Sirutils.Seql.QueryBuilder => {
  const result = buildAll`LIMIT ${safe(adapterApi, value)}`(adapterApi)

  result.cache.limit = `${value}`
  result.operations.push(LIMIT)

  return result
}
