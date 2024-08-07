import type { BlobType, LiteralUnion } from '@sirutils/core'

import type { SeqlTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      seql: SeqlTags
    }

    interface Env {
      console: 'silent' | 'normal'
    }

    namespace Seql {
      type ValueRecord<T = BlobType> = Record<string, T>

      interface Entry<T> {
        value: T
        key?: string
      }

      interface QueryBuilder<T = BlobType> {
        $type: symbol
        $name: string

        cache: Record<LiteralUnion<'entry', string>, string | null>
        entries: Entry<T>[]
        operations: symbol[]

        buildText(nextParamID: number): string
      }

      interface Query<T = BlobType> {
        $type: symbol
        text: string
        values: T[]

        builder: Sirutils.Seql.QueryBuilder<T>
      }

      interface AdapterApi {
        parameterPattern: (str: string) => string
        handleRaw: (data: string) => string
        handleJson: (data: unknown) => unknown
        transformData: <T>(data: T) => T
        transformResponse: <T>(data: T) => T
        generateCacheKey: <T>(query: Sirutils.Seql.Query<T>) => string
      }
    }
  }
}
