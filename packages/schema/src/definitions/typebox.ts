import type { TypeCheck } from '@sinclair/typebox/compiler'
import type { ValueError } from '@sinclair/typebox/errors'
import type { BlobType } from '@sirutils/core'

import type { BooleanString } from '../internal/boolean-string'
import type { File, Files } from '../internal/file'
import type { Numeric } from '../internal/numeric'
import type { ObjectString } from '../internal/object-string'
import type { MaybeEmpty, Nullable } from '../internal/other'

declare module '@sinclair/typebox' {
  interface JavaScriptTypeBuilder {
    // biome-ignore lint/style/useNamingConvention: Redundant
    File: typeof File
    // biome-ignore lint/style/useNamingConvention: Redundant
    Files: ReturnType<typeof Files>
    // biome-ignore lint/style/useNamingConvention: Redundant
    Numeric: ReturnType<typeof Numeric>
    // biome-ignore lint/style/useNamingConvention: Redundant
    BooleanString: ReturnType<typeof BooleanString>
    // biome-ignore lint/style/useNamingConvention: Redundant
    ObjectString: ReturnType<typeof ObjectString>
    // biome-ignore lint/style/useNamingConvention: Redundant
    Nullable: ReturnType<typeof Nullable>
    // biome-ignore lint/style/useNamingConvention: Redundant
    MaybeEmpty: ReturnType<typeof MaybeEmpty>
  }

  interface SchemaOptions {
    error?:
      | string
      | boolean
      | number
      // biome-ignore lint/complexity/noBannedTypes: Redundant
      | Object
      | ((validation: {
          errors: ValueError[]
          type: string
          validator: TypeCheck<BlobType>
          value: unknown
          // biome-ignore lint/complexity/noBannedTypes: Redundant
        }) => string | boolean | number | Object | void)
  }
}
