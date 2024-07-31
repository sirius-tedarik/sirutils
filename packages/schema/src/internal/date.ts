import { type DateOptions, type TDate, Type } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { ProjectError } from '@sirutils/core'

import { schemaTags } from '../tag'

export const DateType = (t: typeof Type) => (property?: DateOptions) => {
  const schema = Type.Date(property)

  return t
    .Transform(
      t.Union(
        [
          Type.Date(property),
          t.String({
            format: 'date',
            default: new Date().toISOString(),
          }),
          t.String({
            format: 'date-time',
            default: new Date().toISOString(),
          }),
        ],
        property
      )
    )
    .Decode(value => {
      if (value instanceof Date) {
        return value
      }

      const date = new Date(value)

      if (!Value.Check(schema, date)) {
        ProjectError.create(schemaTags.invalidTypeDate, schemaTags.invalidTypeDate)
          .appendData([schema, date])
          .throw()
      }

      return date
    })
    .Encode(value => {
      if (typeof value === 'string') {
        return new Date(value)
      }

      return value
    }) as unknown as TDate
}
