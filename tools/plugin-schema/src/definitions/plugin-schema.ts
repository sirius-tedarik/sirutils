import type { BlobType } from '@sirutils/core'
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
    }
  }
}
