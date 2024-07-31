import type { SchemaOptions, TUnsafe } from '@sinclair/typebox'

import type { SchemaTags } from '../tag'

export type MaybeArray<T> = T | T[]

declare global {
  namespace Sirutils {
    interface CustomErrors {
      schema: SchemaTags
    }

    namespace Schema {
      namespace TypeOptions {
        type FileUnit = number | `${number}${'k' | 'm'}`

        interface File extends SchemaOptions {
          type?: MaybeArray<
            | (string & {})
            | 'image'
            | 'image/jpeg'
            | 'image/png'
            | 'image/gif'
            | 'image/tiff'
            | 'image/x-icon'
            | 'image/svg'
            | 'image/webp'
            | 'image/avif'
            | 'audio'
            | 'audio/mpeg'
            | 'audio/x-ms-wma'
            | 'audio/vnd.rn-realaudio'
            | 'audio/x-wav'
            | 'video'
            | 'video/mpeg'
            | 'video/mp4'
            | 'video/quicktime'
            | 'video/x-ms-wmv'
            | 'video/x-msvideo'
            | 'video/x-flv'
            | 'video/webm'
            | 'text'
            | 'text/css'
            | 'text/csv'
            | 'text/html'
            | 'text/javascript'
            | 'text/plain'
            | 'text/xml'
            | 'application'
            | 'application/ogg'
            | 'application/pdf'
            | 'application/xhtml'
            | 'application/html'
            | 'application/json'
            | 'application/ld+json'
            | 'application/xml'
            | 'application/zip'
            | 'font'
            | 'font/woff2'
            | 'font/woff'
            | 'font/ttf'
            | 'font/otf'
          >
          minSize?: Sirutils.Schema.TypeOptions.FileUnit
          maxSize?: Sirutils.Schema.TypeOptions.FileUnit
        }

        interface Files extends Sirutils.Schema.TypeOptions.File {
          minItems?: number
          maxItems?: number
        }
      }

      namespace Types {
        type File = (
          options?: Partial<Sirutils.Schema.TypeOptions.Files> | undefined
        ) => TUnsafe<Sirutils.Schema.TypeOptions.File>

        type Files = (
          options?: Partial<Sirutils.Schema.TypeOptions.Files> | undefined
        ) => TUnsafe<Sirutils.Schema.TypeOptions.File[]>
      }
    }
  }
}
