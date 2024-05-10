import type { BlobType } from '@sirutils/core'

import { generate, join, raw, toSqlBuilder } from './utils/builder'
import { mergeLists } from './utils/common'

/**
 * Use this for creating queries
 */
export const query = (texts: TemplateStringsArray, ...values: BlobType[]): Sirutils.Seql.Query => {
  const result = generate(buildAll(texts, ...values))

  return result
}

/**
 * Internal template string tag that builds all props.
 */
export const buildAll = (
  texts: TemplateStringsArray,
  ...values: BlobType[]
): Sirutils.Seql.BuildedQuery => {
  const textSqlBuilders = texts.map(raw)
  const valueSqlBuilders = values.map(toSqlBuilder)

  const sqlBuilders = mergeLists(textSqlBuilders, valueSqlBuilders)

  return join(sqlBuilders)
}
