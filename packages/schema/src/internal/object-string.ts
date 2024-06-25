import type { ObjectOptions, TObject, TProperties, Type } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import { ProjectError } from '@sirutils/core'
import { schemaTags } from '../tag'

export const ObjectString =
  (t: typeof Type) =>
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  <T extends TProperties = {}>(properties: T = {} as T, options?: ObjectOptions) => {
    const schema = t.Object(properties, options)
    const defaultValue = JSON.stringify(Value.Create(schema))

    return t
      .Transform(
        t.Union([
          t.String({
            format: 'ObjectString',
            default: defaultValue,
          }),
          schema,
        ])
      )
      .Decode(value => {
        if (typeof value === 'string') {
          try {
            value = JSON.parse(value as string)
          } catch {
            ProjectError.create(
              schemaTags.invalidTypeObjectString,
              schemaTags.invalidTypeObjectString
            )
              .appendData([schema, value])
              .throw()
          }

          if (!Value.Check(schema, value)) {
            ProjectError.create(
              schemaTags.invalidTypeObjectString,
              schemaTags.invalidTypeObjectString
            )
              .appendData([schema, value])
              .throw()
          }

          return value
        }

        return value
      })
      .Encode(value => {
        if (typeof value === 'string') {
          try {
            value = JSON.parse(value as string)
          } catch {
            ProjectError.create(
              schemaTags.invalidTypeObjectString,
              schemaTags.invalidTypeObjectString
            )
              .appendData([schema, value])
              .throw()
          }
        }

        if (!Value.Check(schema, value)) {
          ProjectError.create(
            schemaTags.invalidTypeObjectString,
            schemaTags.invalidTypeObjectString
          )
            .appendData([schema, value])
            .throw()
        }

        return JSON.stringify(value)
      }) as unknown as TObject<T>
  }
