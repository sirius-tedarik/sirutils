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

      export interface Query<T = BlobType> {
        $type: symbol
        text: string
        values: T[]

        builder: BuildedQuery<T>
      }

      export interface BuildedQuery<T = BlobType> {
        $type: symbol
        values: T[]
        buildText(nextParamID: number): string
      }

      export interface AdapterOptions {
        paramterPattern: (str: string) => string
      }

      export interface Env {
        adapter: 'mysql' | 'postgres'
      }
    }
  }
}
