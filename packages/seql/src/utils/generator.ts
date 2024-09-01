import type { BlobType } from '@sirutils/core'

import { GENERATED } from './consts'

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
