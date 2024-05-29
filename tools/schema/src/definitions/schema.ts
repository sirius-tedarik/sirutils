import type { BlobType } from '@sirutils/core'

import type { JSONSchema7 } from 'json-schema'
import type { SchemaTags } from '../tag'

declare global {
  // biome-ignore lint/style/noNamespace: Redundant
  namespace Sirutils {
    interface CustomErrors {
      schema: SchemaTags
    }

    // biome-ignore lint/style/noNamespace: Redundant
    namespace Schema {
      // biome-ignore lint/style/noNamespace: Redundant
      namespace Generated {
        // biome-ignore lint/suspicious/noEmptyInterface: For future overriding
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
