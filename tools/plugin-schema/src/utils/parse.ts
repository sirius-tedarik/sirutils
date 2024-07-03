import type { BlobType } from '@sirutils/core'
import type { JSONSchema7, JSONSchema7Type, JSONSchema7TypeName } from 'json-schema'

import {
  isNullType,
  type AllOfSchema,
  type AnyOfSchema,
  type ArraySchema,
  type ConstSchema,
  type EnumSchema,
  type MultipleTypesSchema,
  type NotSchema,
  type ObjectSchema,
  type OneOfSchema,
  type UnknownSchema,
} from '../internal/matchers'
import { isBoolean, isNumber, isString } from '../internal/utils'

import { addOptionalModifier } from './other'
import { collect } from './collect'

export const parseObject = (schema: ObjectSchema) => {
  const schemaOptions = parseSchemaOptions(schema)
  const properties = schema.properties
  const requiredProperties = schema.required
  if (properties === undefined) {
    return 't.Unknown()'
  }
  const attributes = Object.entries(properties)
  // NOTE: Just always quote the propertyName here to make sure we don't run
  // into issues as they came up before
  // [here](https://github.com/xddq/schema2typebox/issues/45) or
  // [here](https://github.com/xddq/schema2typebox/discussions/35). Since we run
  // prettier as "postprocessor" anyway we will also ensure to still have a sane
  // output without any unnecessarily quotes attributes.
  const code = attributes
    .map(([propertyName, schema]) => {
      return `"${propertyName}": ${addOptionalModifier(
        collect(schema),
        propertyName,
        requiredProperties
      )}`
    })
    .join(',\n')
  return schemaOptions === undefined
    ? `t.Object({${code}})`
    : `t.Object({${code}}, ${schemaOptions})`
}

export const parseEnum = (schema: EnumSchema) => {
  const schemaOptions = parseSchemaOptions(schema)
  const code = schema.enum.reduce<string>((acc: string, schema: BlobType) => {
    return `${acc}${acc === '' ? '' : ','} ${parseType(schema)}`
  }, '')
  return schemaOptions === undefined ? `t.Union([${code}])` : `t.Union([${code}], ${schemaOptions})`
}

export const parseConst = (schema: ConstSchema): string => {
  const schemaOptions = parseSchemaOptions(schema)
  if (Array.isArray(schema.const)) {
    const code = schema.const.reduce<string>((acc: string, schema: BlobType) => {
      return `${acc}${acc === '' ? '' : ',\n'} ${parseType(schema)}`
    }, '')
    return schemaOptions === undefined
      ? `t.Union([${code}])`
      : `t.Union([${code}], ${schemaOptions})`
  }
  // TODO: case where const is object..?
  if (typeof schema.const === 'object') {
    return 't.Todo(const with object)'
  }
  if (typeof schema.const === 'string') {
    return schemaOptions === undefined
      ? `t.Literal("${schema.const}")`
      : `t.Literal("${schema.const}", ${schemaOptions})`
  }
  return schemaOptions === undefined
    ? `t.Literal(${schema.const})`
    : `t.Literal(${schema.const}, ${schemaOptions})`
}

export const parseUnknown = (_: UnknownSchema): string => {
  return 't.Unknown()'
}

export const parseType = (type: JSONSchema7Type): string => {
  if (isString(type)) {
    return `t.Literal("${type}")`
  }
  if (isNullType(type)) {
    return 't.Null()'
  }
  if (isNumber(type) || isBoolean(type)) {
    return `t.Literal(${type})`
  }
  if (Array.isArray(type)) {
    return `t.Array([${type.map(parseType)}])`
  }
  const code = Object.entries(type).reduce<string>((acc, [key, value]) => {
    return `${acc}${acc === '' ? '' : ',\n'}${key}: ${parseType(value)}`
  }, '')
  return `t.Object({${code}})`
}

export const parseAnyOf = (schema: AnyOfSchema): string => {
  const schemaOptions = parseSchemaOptions(schema)
  const code = schema.anyOf.reduce<string>((acc: string, schema: BlobType) => {
    return `${acc}${acc === '' ? '' : ',\n'} ${collect(schema)}`
  }, '')
  return schemaOptions === undefined ? `t.Union([${code}])` : `t.Union([${code}], ${schemaOptions})`
}

export const parseAllOf = (schema: AllOfSchema): string => {
  const schemaOptions = parseSchemaOptions(schema)
  const code = schema.allOf.reduce<string>((acc: string, schema: BlobType) => {
    return `${acc}${acc === '' ? '' : ',\n'} ${collect(schema)}`
  }, '')
  return schemaOptions === undefined
    ? `t.Intersect([${code}])`
    : `t.Intersect([${code}], ${schemaOptions})`
}

export const parseOneOf = (schema: OneOfSchema): string => {
  const schemaOptions = parseSchemaOptions(schema)
  const code = schema.oneOf.reduce<string>((acc: string, schema: BlobType) => {
    return `${acc}${acc === '' ? '' : ',\n'} ${collect(schema)}`
  }, '')
  return schemaOptions === undefined ? `OneOf([${code}])` : `OneOf([${code}], ${schemaOptions})`
}

export const parseNot = (schema: NotSchema): string => {
  const schemaOptions = parseSchemaOptions(schema)
  return schemaOptions === undefined
    ? `t.Not(${collect(schema.not)})`
    : `t.Not(${collect(schema.not)}, ${schemaOptions})`
}

export const parseArray = (schema: ArraySchema): string => {
  const schemaOptions = parseSchemaOptions(schema)

  if (Array.isArray(schema.items)) {
    const code = schema.items.reduce<string>((acc: string, schema: BlobType) => {
      return `${acc}${acc === '' ? '' : ',\n'} ${collect(schema)}`
    }, '')
    return schemaOptions === undefined
      ? `t.Array(t.Union(${code}))`
      : `t.Array(t.Union(${code}),${schemaOptions})`
  }
  const itemsType = schema.items ? collect(schema.items) : 't.Unknown()'
  return schemaOptions === undefined
    ? `t.Array(${itemsType})`
    : `t.Array(${itemsType},${schemaOptions})`
}

export const parseWithMultipleTypes = (schema: MultipleTypesSchema): string => {
  const code = schema.type.reduce<string>((acc: string, typeName: BlobType) => {
    return `${acc}${acc === '' ? '' : ',\n'} ${parseTypeName(typeName, schema)}`
  }, '')
  return `t.Union([${code}])`
}

export const parseTypeName = (type: JSONSchema7TypeName, schema: JSONSchema7 = {}): string => {
  const schemaOptions = parseSchemaOptions(schema)

  if (type === 'number' || type === 'integer') {
    return schemaOptions === undefined ? 't.Number()' : `t.Number(${schemaOptions})`
  }
  if (type === 'string') {
    return schemaOptions === undefined ? 't.String()' : `t.String(${schemaOptions})`
  }
  if (type === 'boolean') {
    return schemaOptions === undefined ? 't.Boolean()' : `t.Boolean(${schemaOptions})`
  }
  if (type === 'null') {
    return schemaOptions === undefined ? 't.Null()' : `t.Null(${schemaOptions})`
  }
  if (type === 'object') {
    return parseObject(schema as ObjectSchema)
    // We don't want to trust on build time checking here, json can contain anything
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  }
  if (type === 'array') {
    return parseArray(schema as ArraySchema)
  }
  throw new Error(`Should never happen..? parseType got type: ${type}`)
}

export const parseSchemaOptions = (schema: JSONSchema7): string | undefined => {
  const properties = Object.entries(schema).filter(([key, _value]) => {
    return (
      // NOTE: To be fair, not sure if we should filter out the title. If this
      // makes problems one day, think about not filtering it.
      key !== 'title' &&
      key !== 'type' &&
      key !== 'items' &&
      key !== 'allOf' &&
      key !== 'anyOf' &&
      key !== 'oneOf' &&
      key !== 'not' &&
      key !== 'properties' &&
      key !== 'required' &&
      key !== 'const' &&
      key !== 'enum'
    )
  })
  if (properties.length === 0) {
    return undefined
  }
  const result = properties.reduce<Record<string, unknown>>((acc, [key, value]) => {
    acc[key] = value
    return acc
  }, {})
  return JSON.stringify(result)
}
