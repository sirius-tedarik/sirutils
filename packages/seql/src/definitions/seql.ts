import type { BlobType } from '@sirutils/core'

import type { SeqlTags } from '../tag'

declare global {
  // biome-ignore lint/style/noNamespace: Redundant
  namespace Sirutils {
    interface CustomErrors {
      seql: SeqlTags
    }

    // biome-ignore lint/style/noNamespace: Redundant
    namespace Seql {
      export type ValueRecord<T = BlobType> = Record<string, T>

      export interface QueryBuilder<T = BlobType> {
        $type: symbol
        entries: [string | null, T, boolean][]
        cacheKeys: string[]
        operations: symbol[]

        buildText(nextParamID: number): string
      }

      export interface Query<T = BlobType> {
        $type: symbol
        text: string
        values: T[]

        builder: Sirutils.Seql.QueryBuilder<T>
      }

      export interface AdapterOptions {
        paramterPattern: (str: string) => string
      }

      export interface Env {
        console: 'silent' | 'normal'
        adapter: 'mysql' | 'postgres'
      }
    }
  }
}