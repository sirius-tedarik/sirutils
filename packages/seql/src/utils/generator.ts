import { type BlobType, ProjectError } from '@sirutils/core'

import { EMPTY, GENERATED } from '../internal/consts'
import { unique } from '../internal/utils'
import { seqlTags } from '../tag'

/**
 * Generate the full query result
 */
export const generate = <T>(builder: Sirutils.Seql.QueryBuilder<T>): Sirutils.Seql.Query<T> => {
  return {
    $type: GENERATED,
    text: builder.buildText(1),
    values: builder.entries.map(([, value]) => value).filter(value => value !== EMPTY),

    builder,
  }
}

/**
 * Check is generated
 */
export const isGenerated = (query: BlobType): query is Sirutils.Seql.Query => {
  return query && query.$type === GENERATED
}

/**
 * generates a cache key with query or query builder
 */
export const generateCacheKey = <T>(
  query: Sirutils.Seql.Query<T> | Sirutils.Seql.QueryBuilder<T>
): string | null => {
  const cacheKeys = isGenerated(query) ? query.builder.cacheKeys : query.cacheKeys
  const entries = isGenerated(query) ? query.builder.entries : query.entries
  const tableName = isGenerated(query) ? query.builder.tableName : query.tableName

  if (!tableName) {
    ProjectError.create(seqlTags.tableNotDefined, 'table not defined').throw()
  }

  const result = unique(cacheKeys).reduce((acc, key: string) => {
    const findedEntries = entries
      .filter(([entryKey, , include]) => key === entryKey && include)
      .map(([, value]) => value)

    if (findedEntries.length > 0) {
      const isKeys =
        entries.findIndex(
          ([entryKey, entryValue, include]) => include && entryValue === EMPTY && entryKey === key
        ) > -1

      if (isKeys) {
        // biome-ignore lint/style/noParameterAssign: Redundant
        acc += key

        return acc
      }

      // biome-ignore lint/style/noParameterAssign: Redundant
      acc += `${key}:${findedEntries.join('-')}:`
    }

    return acc
  }, `${tableName}#`)

  if (result === '') {
    return null
  }

  return result.slice(0, -1)
}
