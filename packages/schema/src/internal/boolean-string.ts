import { type SchemaOptions, type TBoolean, Type } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { ProjectError } from '@sirutils/core'
import { schemaTags } from '../tag'

export const BooleanString = (t: typeof Type) => (property?: SchemaOptions) => {
  const schema = Type.Boolean(property)

  return t
    .Transform(
      t.Union(
        [
          t.String({
            format: 'boolean',
            default: false,
          }),
          t.Boolean(property),
        ],
        property
      )
    )
    .Decode(value => {
      if (typeof value === 'string') {
        return value === 'true'
      }

      if (property && !Value.Check(schema, value)) {
        ProjectError.create(
          schemaTags.invalidTypeBooleanString,
          schemaTags.invalidTypeBooleanString
        )
          .appendData([schema, value])
          .throw()
      }

      return value
    })
    .Encode(value => value) as unknown as TBoolean
}
