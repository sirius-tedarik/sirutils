import { type NumberOptions, type TNumber, Type } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { ProjectError } from '@sirutils/core'
import { schemaTags } from '../tag'

export const Numeric = (t: typeof Type) => (property?: NumberOptions) => {
  const schema = Type.Number(property)

  return t
    .Transform(
      t.Union(
        [
          t.String({
            format: 'numeric',
            default: 0,
          }),
          t.Number(property),
        ],
        property
      )
    )
    .Decode(value => {
      const number = +value

      if (Number.isNaN(number)) {
        return value
      }

      if (property && !Value.Check(schema, number)) {
        ProjectError.create(schemaTags.invalidTypeNumeric, schemaTags.invalidTypeNumeric)
          .appendData([schema, number])
          .throw()
      }

      return number
    })
    .Encode(value => value) as unknown as TNumber
}
