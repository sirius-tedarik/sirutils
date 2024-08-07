import { type BlobType, capsule, forward } from '@sirutils/core'

import { seqlTags } from '../tag'

// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as builder from './builder'
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as consts from './consts'
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

    // operations
    and: operations.and.bind(null, adapterApi),
    or: operations.or.bind(null, adapterApi),
    includes: operations.includes.bind(null, adapterApi),
  }) as const

export const createAdapter = capsule(
  async <T extends Sirutils.Seql.AdapterApi = Sirutils.Seql.AdapterApi>(
    cb: () => Promise<T>,
    ...additionalCause: Sirutils.ErrorValues[]
  ): Promise<T & ReturnType<typeof createBindedMethods>> => {
    const adapterApi = await forward(
      async () => {
        const result = await cb()

        return Object.fromEntries(
          Object.entries(result).map(([key, value]) => [key, capsule(value, ...additionalCause)])
        ) as Sirutils.Seql.AdapterApi
      },
      ...additionalCause
    )

    return {
      ...adapterApi,
      ...consts,
      ...builder,
      ...generator,
      ...operations,
      ...createBindedMethods(adapterApi),
    } as unknown as T & ReturnType<typeof createBindedMethods>
  },
  seqlTags.createAdapter
)
