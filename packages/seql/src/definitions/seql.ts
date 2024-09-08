import type { BlobType, LiteralUnion } from '@sirutils/core'

import type { SeqlTags } from '../tag'
import type { createBindedMethods } from '../utils/create-adapter'

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
        $subtype?: symbol

        cache: Record<LiteralUnion<'entry' | 'tableName' | 'columns', string>, string | null>
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
        andGrouping: boolean
        parameterPattern: (str: string) => string
        handleRaw: (data: string) => string
        handleJson: (data: unknown) => unknown
        transformData: <T>(data: T) => T
        transformResponse: <T>(data: T) => T

        columns?: <T>(columnNames?: string[]) => Sirutils.Seql.QueryBuilder<T>
        table?: <T>(tableName: string) => Sirutils.Seql.QueryBuilder<T>
      }

      type BindedApi = ReturnType<typeof createBindedMethods>
    }
  }
}
