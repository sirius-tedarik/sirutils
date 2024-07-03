import type { JSONSchema7 } from 'json-schema'
import type { SchemaPluginTags } from '../tag'
import type { BlobType } from '@sirutils/core'

declare global {
  namespace Sirutils {
    // ------------ Errors ------------

    interface CustomErrors {
      schemaPlugin: SchemaPluginTags
    }

    namespace SchemaPlugin {
      namespace Generated {
        interface Tables {}
      }

      interface Original {
        name: string

        importMaps: Record<string, string>

        fields: {
          name: string
          type: string

          required?: boolean
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
        targetPath: string
        exists: boolean
        splitted: [string, string]

        validator: JSONSchema7
        code: string

        importMaps: Record<string, Sirutils.SchemaPlugin.Normalized>
      }
    }
  }
}
