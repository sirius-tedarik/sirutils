import type { BlobType } from '@sirutils/core'

import type { SeqlTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      seql: SeqlTags
    }

    interface Env {
      console: 'silent' | 'normal'
      adapter: 'mysql' | 'postgres'
    }

    namespace Seql {
      type ValueRecord<T = BlobType> = Record<string, T>

      interface QueryBuilder<T = BlobType> {
        $type: symbol
        entries: [string | null, T, boolean][]
        cacheKeys: string[]
        operations: symbol[]
        tableName: string | null

        buildText(nextParamID: number): string
      }

      interface Query<T = BlobType> {
        $type: symbol
        text: string
        values: T[]

        builder: Sirutils.Seql.QueryBuilder<T>
      }

      interface AdapterOptions {
        parameterPattern: (str: string) => string
        handleJson: (data: unknown) => unknown
      }
    }
  }
}
