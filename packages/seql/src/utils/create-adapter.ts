import { type BlobType, capsule, forward } from '@sirutils/core'
import { type ValueRecord, proxy } from '@sirutils/safe-toolbox'

import { seqlTags } from '../tag'
import { buildAll, extra, object, raw, safe } from './builder'
import type { comparisonToSymbol } from './common'
import { generate } from './generator'
import { and, comparison, includes, insert, limit, or, update } from './operations'

export const createBindedMethods = (adapterApi: BlobType) =>
  ({
    safe: safe.bind(null, adapterApi),
    raw: raw.bind(null, adapterApi),
    extra: extra.bind(null, adapterApi),
    query: (texts: TemplateStringsArray, ...values: BlobType[]) => {
      return generate(buildAll(texts, ...values)(adapterApi))
    },
    table: (tableName: string) => {
      return extra(adapterApi, 'tableName', tableName, undefined, false)
    },
    columns: (columns: string[] = []) => {
      const str = columns.length === 0 ? '*' : columns.join(',')

      return extra(adapterApi, 'columns', str, undefined, false)
    },
    object: <T>(value: T, key?: string) => object<T>(adapterApi, value, key),

    // operations
    and: and.bind(null, adapterApi),
    or: or.bind(null, adapterApi),
    includes: includes.bind(null, adapterApi),
    limit: limit.bind(null, adapterApi),

    update: <T extends ValueRecord>(tableName: string, record: T) =>
      update<T>(adapterApi, tableName, record),
    insert: <T extends ValueRecord>(tableName: string, record: T): Sirutils.Seql.QueryBuilder<T> =>
      insert<T>(adapterApi, tableName, record),
    comparison: <T>(value: T, operation: Parameters<typeof comparisonToSymbol>[0], key?: string) =>
      comparison<T>(adapterApi, value, operation, key),
  }) as const

export const createAdapter = capsule(
  async <T extends Sirutils.Seql.AdapterApi = Sirutils.Seql.AdapterApi>(
    cb: () => Promise<T>,
    ...additionalCause: Sirutils.ErrorValues[]
  ): Promise<ReturnType<typeof createBindedMethods> & T> => {
    const adapterApi = await forward(cb, ...additionalCause)

    if (typeof adapterApi.andGrouping === 'undefined') {
      adapterApi.andGrouping = true
    }

    return proxy(
      {
        ...adapterApi,
        ...createBindedMethods(adapterApi),
      },
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      additionalCause[0]!,
      true
    )
  },
  seqlTags.createAdapter
)
