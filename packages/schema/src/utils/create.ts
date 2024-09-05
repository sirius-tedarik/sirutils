import {
  type BlobType,
  ProjectError,
  type Result,
  type ResultAsync,
  capsule,
  wrap,
} from '@sirutils/core'
import type { ValidationSchema } from 'fastest-validator'

import { schemaTags } from '../tag'
import { validator } from './validator'

export const createSyncSchema = capsule(
  <T>(schema: ValidationSchema<T>): ((value: T) => Result<true, Sirutils.ProjectErrorType>) => {
    const compiled = validator.compile(schema)

    schema.$$async = false

    return wrap((value: T) => {
      const result = compiled(value)

      if (Array.isArray(result) && result) {
        return ProjectError.create(schemaTags.invalidData, 'schema doesnt match')
          .appendData([schema, value])
          .throw()
      }

      return true
    }, schemaTags.validator) as BlobType
  },
  schemaTags.createSync
)

export const createAsyncSchema = capsule(
  <T>(
    schema: ValidationSchema<T>
  ): ((value: T) => ResultAsync<true, Sirutils.ProjectErrorType>) => {
    const compiled = validator.compile(schema)

    schema.$$async = false

    return wrap(async (value: T) => {
      const result = await compiled(value)

      if (Array.isArray(result) && result) {
        return ProjectError.create(schemaTags.invalidData, 'schema doesnt match')
          .appendData([schema, value])
          .throw()
      }

      return true
    }, schemaTags.validator) as BlobType
  },
  schemaTags.createAsync
)
