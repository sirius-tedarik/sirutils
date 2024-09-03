import { type BlobType, capsule, forward } from '@sirutils/core'
import { proxy } from '@sirutils/safe-toolbox'

import { seqlTags } from '../tag'

// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as builder from './builder'
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as generator from './generator'
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as operations from './operations'

export const createBindedMethods = (adapterApi: BlobType) =>
  ({
    safe: builder.safe.bind(null, adapterApi),
    raw: builder.raw.bind(null, adapterApi),
    extra: builder.extra.bind(null, adapterApi),
    query: (texts: TemplateStringsArray, ...values: BlobType[]) => {
      return generator.generate(adapterApi, builder.buildAll(texts, ...values)(adapterApi))
    },
    table: (tableName: string) => {
      return builder.extra(adapterApi, 'tableName', tableName, undefined, false)
    },

    columns: (columns: string[] = []) => {
      const str = columns.length === 0 ? '*' : columns.join(',')

      return builder.extra(adapterApi, 'columns', str, undefined, false)
    },

    // operations
    and: operations.and.bind(null, adapterApi),
    or: operations.or.bind(null, adapterApi),
    includes: operations.includes.bind(null, adapterApi),
    update: operations.update.bind(null, adapterApi),
  }) as const

export const createAdapter = capsule(
  async <T extends Sirutils.Seql.AdapterApi = Sirutils.Seql.AdapterApi>(
    cb: () => Promise<T>,
    ...additionalCause: Sirutils.ErrorValues[]
  ): Promise<ReturnType<typeof createBindedMethods> & T> => {
    const adapterApi = await forward(cb, ...additionalCause)

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
