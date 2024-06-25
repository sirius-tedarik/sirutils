import { type Type, TypeRegistry } from '@sinclair/typebox'
import { TypeSystem } from '@sinclair/typebox/system'
import type { BlobType } from '@sirutils/core'

const parseFileUnit = (size: Sirutils.Schema.TypeOptions.FileUnit) => {
  if (typeof size === 'string') {
    switch (size.slice(-1)) {
      case 'k':
        return +size.slice(0, size.length - 1) * 1024

      case 'm':
        return +size.slice(0, size.length - 1) * 1048576

      default:
        return +size
    }
  }

  return size
}

const validateFile = (options: Sirutils.Schema.TypeOptions.File, value: BlobType) => {
  if (!(value instanceof Blob)) {
    return false
  }

  if (options.minSize && value.size < parseFileUnit(options.minSize)) {
    return false
  }

  if (options.maxSize && value.size > parseFileUnit(options.maxSize)) {
    return false
  }

  if (options.extension) {
    if (typeof options.extension === 'string') {
      if (!value.type.startsWith(options.extension)) {
        return false
      }
    } else {
      for (let i = 0; i < options.extension.length; i++) {
        if (value.type.startsWith(options.extension[i])) {
          return true
        }
      }

      return false
    }
  }

  return true
}

export const File: Sirutils.Schema.Types.File =
  (TypeRegistry.Get('Files') as unknown as Sirutils.Schema.Types.File) ??
  TypeSystem.Type<File, Sirutils.Schema.TypeOptions.File>('File', validateFile)

const FilesType: Sirutils.Schema.Types.Files =
  (TypeRegistry.Get('Files') as unknown as Sirutils.Schema.Types.Files) ??
  TypeSystem.Type<File[], Sirutils.Schema.TypeOptions.Files>('Files', (options, value) => {
    if (!Array.isArray(value)) {
      return validateFile(options, value)
    }

    if (options.minItems && value.length < options.minItems) {
      return false
    }

    if (options.maxItems && value.length > options.maxItems) {
      return false
    }

    for (let i = 0; i < value.length; i++) {
      if (!validateFile(options, value[i])) {
        return false
      }
    }

    return true
  })

export const Files =
  (t: typeof Type) =>
  (options: Sirutils.Schema.TypeOptions.Files = {}) =>
    t
      .Transform(FilesType(options))
      .Decode(value => {
        if (Array.isArray(value)) {
          return value
        }
        return [value]
      })
      .Encode(value => value)
