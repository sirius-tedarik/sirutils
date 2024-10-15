import { type BlobType, ProjectError, capsule, unwrap, wrap } from '@sirutils/core'

import { schemaTags } from '../tag'
import { validator } from './validator'

export const createSyncSchema = capsule(
  <const S extends Sirutils.Schema.ValidationSchema<BlobType>>(schema: S) => {
    const compiled = validator.compile(schema)

    schema.$$async = false

    return wrap((value: Sirutils.Schema.Compose<Sirutils.Schema.ExtractSchemaType<S>>) => {
      const result = compiled(value)

      if (Array.isArray(result) && result) {
        return ProjectError.create(schemaTags.invalidData, 'schema doesnt match')
          .appendData([schema, value])
          .throw()
      }

      return true as const
    }, schemaTags.validator)
  },
  schemaTags.createSync
)

export const createAsyncSchema = capsule(
  <const S extends Sirutils.Schema.ValidationSchema<BlobType>>(schema: S) => {
    const compiled = validator.compile(schema)

    schema.$$async = true

    return wrap(async (value: Sirutils.Schema.Compose<Sirutils.Schema.ExtractSchemaType<S>>) => {
      const result = await compiled(value)

      if (Array.isArray(result) && result) {
        return ProjectError.create(schemaTags.invalidData, 'schema doesnt match')
          .appendData([schema, value])
          .throw()
      }

      return true as const
    }, schemaTags.validator)
  },
  schemaTags.createAsync
)

export const syncSchema = capsule(
  <const S extends Sirutils.Schema.ValidationSchema<BlobType>>(schema: S) => {
    const compiled = createSyncSchema(schema)
    return capsule((value: S) => unwrap(compiled(value as BlobType)), schemaTags.validator)
  },
  schemaTags.syncSchema
)

export const asyncSchema = capsule(
  <const S extends Sirutils.Schema.ValidationSchema<BlobType>>(schema: S) => {
    const compiled = createAsyncSchema(schema)
    return capsule(
      async (value: S) => unwrap(await compiled(value as BlobType)),
      schemaTags.validator
    )
  },
  schemaTags.asyncSchema
)
