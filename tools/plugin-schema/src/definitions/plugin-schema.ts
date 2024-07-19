import type { BlobType } from '@sirutils/core'
import type { Static, TAnySchema, TArray, TypeCheck } from '@sirutils/schema'
import type { JSONSchema7 } from 'json-schema'

import type { SchemaPluginTags } from '../tag'

declare global {
  namespace Sirutils {
    // ------------ Errors ------------

    interface CustomErrors {
      schemaPlugin: SchemaPluginTags
    }

    namespace Schema {
      namespace Generated {
        interface Tables {}
      }
    }

    namespace SchemaPlugin {
      interface Original {
        name: string

        importMaps: Record<string, string>

        fields: {
          name: string
          type: string

          required?: boolean
          populate?: boolean
          default?: unknown
          [x: string]: BlobType
        }[]

        indexes: {
          name: string
          fields: string[]
        }[]
      }

      interface Normalized
        extends Pick<Sirutils.SchemaPlugin.Original, 'name' | 'indexes' | 'fields'> {
        path: string
        checksum: string
        filePath: string
        targetPath: string
        exists: boolean
        splitted: [string, string]

        validator: JSONSchema7
        code: string
        original: Sirutils.SchemaPlugin.Original

        importMaps: Record<string, Sirutils.SchemaPlugin.Normalized>
      }

      interface Output<T extends TAnySchema> {
        type: T
        compiled: TypeCheck<TArray<T>>
        schema: JSONSchema7
        original: Sirutils.SchemaPlugin.Original
        check: (datas: Static<T>[]) => Static<T>[]
      }
    }
  }
}
