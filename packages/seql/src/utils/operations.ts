import { AND, INSERT, OR, UPDATE } from '../internal/consts'
import { extractKeys, filterUndefined } from '../internal/utils'
import { buildAll, isBuilder, join, json, raw, safe, toSqlBuilder } from './builder'
import { isGenerated } from './generator'

/**
 * Object to chained AND (use after WHERE)
 */
export const and = <T>(
  record: Sirutils.Seql.ValueRecord,
  include?: string[]
): Sirutils.Seql.QueryBuilder<T> => {
  if (isBuilder(record)) {
    return record
  }
  if (isGenerated(record)) {
    return record.builder
  }

  const columnValues = Object.entries(filterUndefined(record))
  const andChainBuilders = columnValues.map(([columnName, columnValue]) => {
    return buildAll`${raw(columnName)} = ${safe(columnValue, columnName, include ? include : true)}`
  })

  const andChain = join(andChainBuilders, ' AND ')
  const result = buildAll`(${andChain})`

  result.operations.push(AND)
  result.cacheKeys.push(...(include ? include : Object.keys(record)))

  return result
}

/**
 * Object to chained OR (use after WHERE)
 */
export const or = <T>(records: Sirutils.Seql.ValueRecord[]): Sirutils.Seql.QueryBuilder<T> => {
  if (records.length === 0) {
    return raw('')
  }
  if (records.length === 1) {
    if (isBuilder(records[0])) {
      return records[0]
    }

    if (isGenerated(records[0])) {
      return records[0].builder
    }
  }

  const andChainBuilders = records.map(record => {
    return and(record)
  })

  const andChain = join(andChainBuilders, ' OR ')
  const result = buildAll`(${andChain})`

  result.operations.push(OR)

  return result
}

/**
 * Objects to chained VALUES (use after INTO $tableName)
 */
export const insert = <T>(records: Sirutils.Seql.ValueRecord[]): Sirutils.Seql.QueryBuilder<T> => {
  const columnNames = extractKeys(records.map(filterUndefined))
  const identifiers = columnNames.join(', ')

  const insertChainBuilders = records.map(record => {
    const recordColumns = columnNames.map(columnName =>
      toSqlBuilder(json(record[columnName]), columnName)
    )
    return buildAll`(${join(recordColumns, ', ')})`
  })

  const insertChain = join(insertChainBuilders, ', ')
  const result = buildAll`(${raw(identifiers)}) VALUES ${insertChain}`

  result.operations.push(INSERT)

  return result
}

/**
 * Object to chained Update (use after SET)
 */
export const update = (record: Sirutils.Seql.ValueRecord): Sirutils.Seql.QueryBuilder => {
  const updateValues = Object.entries(filterUndefined(record))
  const updateChainBuilders = updateValues.map(([columnName, columnValue]) => {
    return buildAll`${raw(columnName)} = ${toSqlBuilder(json(columnValue), columnName)}`
  })

  const result = join(updateChainBuilders, ', ')

  result.operations.push(UPDATE)

  return result
}
