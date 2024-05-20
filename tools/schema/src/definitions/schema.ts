import type { BlobType } from '@sirutils/core'

import type { SchemaTags } from '../tag'

declare global {
  // biome-ignore lint/style/noNamespace: Redundant
  namespace Sirutils {
    interface CustomErrors {
      schema: SchemaTags
    }

    // biome-ignore lint/style/noNamespace: Redundant
    namespace Schema {
      export interface Normalized {
        name: string
        path: string
        checksum: string
        exists: boolean

        importMaps: Record<string, Sirutils.Schema.Normalized>

        fields: {
          name: string
          type: string
          [x: string]: BlobType
        }[]
        indexes: {
          name: string
          fields: string[]
        }[]
      }
    }
  }
}
