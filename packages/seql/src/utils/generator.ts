import { ProjectError, type BlobType } from '@sirutils/core'

import { CACHEABLE_OPERATIONS, GENERATED } from './consts'
import { seqlTags } from '../tag'

/**
 * Generate the full query result
 */
export const generate = <T>(
  adapterApi: Sirutils.Seql.AdapterApi,
  builder: Sirutils.Seql.QueryBuilder<T>
): Sirutils.Seql.Query<T> => {
  return {
    $type: GENERATED,
    text: builder.buildText(1).replaceAll('\n', ' ').trim(),
    values: builder.entries.reduce((acc, curr) => {
      if (curr.value) {
        acc.push(adapterApi.transformData(curr.value))
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

export const generateCacheKey = <T>(query: Sirutils.Seql.Query<T>) => {
  if (!query.builder.cache.tableName || query.builder.cache.tableName.length === 0) {
    ProjectError.create(seqlTags.cacheTableName, 'table name is invalid')
      .appendData([query])
      .throw()
  }

  if (query.builder.operations.some(operation => !CACHEABLE_OPERATIONS.includes(operation))) {
    ProjectError.create(
      seqlTags.cacheEvicted,
      `Cannot generate cache key except this methods ${CACHEABLE_OPERATIONS}`
    )
      .appendData([query])
      .throw()
  }

  return `${query.builder.cache.tableName}#${query.builder.cache.entry}`.trim().replaceAll(' ', '')
}
