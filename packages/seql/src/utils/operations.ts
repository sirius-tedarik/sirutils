import { buildAll } from '../seql'
import { join, raw, toSqlBuilder } from './builder'
import { extractKeys, filterUndefined } from './common'

/**
 * Object to chained AND (use after WHERE)
 */
export const and = <T>(record: Sirutils.Seql.ValueRecord): Sirutils.Seql.BuildedQuery<T> => {
  const columnValues = Object.entries(filterUndefined(record))

  const andChainBuilders = columnValues.map(([columnName, columnValue]) => {
    return buildAll`${raw(columnName)} = ${columnValue}`
  })

  const andChain = join(andChainBuilders, ' AND ')

  return buildAll`(${andChain})`
}

/**
 * Object to chained OR (use after WHERE)
 */
export const or = <T>(...records: Sirutils.Seql.ValueRecord[]): Sirutils.Seql.BuildedQuery<T> => {
  const andChainBuilders = records.map(record => {
    return and(record)
  })

  const andChain = join(andChainBuilders, ' OR ')

  return buildAll`(${andChain})`
}

/**
 * Objects to chained VALUES (use after INTO $tableName)
 */
export const insert = <T>(
  ...records: Sirutils.Seql.ValueRecord[]
): Sirutils.Seql.BuildedQuery<T> => {
  const columnNames = extractKeys(records.map(filterUndefined))
  const identifiers = columnNames.join(', ')

  const insertChainBuilders = records.map(record => {
    const recordColumns = columnNames.map(columnName => toSqlBuilder(record[columnName]))
    return buildAll`(${join(recordColumns, ', ')})`
  })

  const insertChain = join(insertChainBuilders, ', ')

  return buildAll`(${raw(identifiers)}) VALUES ${insertChain}`
}

/**
 * Object to chained Update (use after SET)
 */
export const update = (record: Sirutils.Seql.ValueRecord): Sirutils.Seql.BuildedQuery => {
  const updateValues = Object.entries(filterUndefined(record))

  const updateChainBuilders = updateValues.map(([columnName, columnValue]) => {
    return buildAll`${raw(columnName)} = ${columnValue}`
  })

  return join(updateChainBuilders, ', ')
}
