import type { BlobType } from '@sirutils/core'

import type { JSONSchema7 } from 'json-schema'
import type { SchemaTags } from '../tag'

declare global {
  namespace Sirutils {
    interface CustomErrors {
      schema: SchemaTags
    }

    namespace Schema {
      namespace Generated {
        interface Tables {}
      }

      export interface Original {
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

      export interface Normalized
        extends Pick<Sirutils.Schema.Original, 'name' | 'indexes' | 'fields'> {
        path: string
        checksum: string
        targetPath: string
        exists: boolean

        validator: JSONSchema7

        importMaps: Record<string, Sirutils.Schema.Normalized>
      }
    }
  }
}
