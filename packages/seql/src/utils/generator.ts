import { type BlobType, ProjectError } from '@sirutils/core'

import { seqlTags } from '../tag'
import { CACHEABLE_OPERATIONS, GENERATED } from './consts'

/**
 * Generate the full query result
 */
export const generate = <T>(builder: Sirutils.Seql.QueryBuilder<T>): Sirutils.Seql.Query<T> => {
  return {
    $type: GENERATED,
    text: builder.buildText(1).replaceAll('\n', ' ').trim(),
    values: builder.entries.reduce((acc, curr) => {
      if (curr.value) {
        acc.push(curr.value)
      }

      return acc
    }, [] as T[]),

    builder,
  }
}

/**
 * Check is generated
 */
export const isGenerated = (query: BlobType): query is Sirutils.Seql.Query => {
  return query && query.$type === GENERATED
}

export const generateCacheKey = <T>(dbName: string, query: Sirutils.Seql.Query<T>) => {
  if (!query.builder.cache.tableName || query.builder.cache.tableName.length === 0) {
    return ProjectError.create(seqlTags.cacheTableName, 'table name is invalid')
      .appendData(query)
      .throw()
  }

  if (query.builder.operations.length === 0) {
    return ProjectError.create(seqlTags.cacheInvalid, 'cannot generate cache-key for this query')
      .appendData(query)
      .throw()
  }

  if (query.builder.operations.some(operation => !CACHEABLE_OPERATIONS.includes(operation))) {
    return ProjectError.create(
      seqlTags.cacheEvicted,
      `Cannot generate cache key except this methods ${CACHEABLE_OPERATIONS.map(s => String(s))}`
    )
      .appendData(query)
      .throw()
  }

  return `${dbName}#${query.builder.cache.tableName}${!query.builder.cache.columns || query.builder.cache.columns === '*' ? '' : `#${query.builder.cache.columns}`}#${query.builder.cache.entry}${query.builder.cache.limit ? `!${query.builder.cache.limit}` : ''}`
    .trim()
    .replaceAll(' ', '')
}
