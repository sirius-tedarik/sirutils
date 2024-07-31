import type { JSONSchema7Definition } from 'json-schema'

import {
  isAllOfSchema,
  isAnyOfSchema,
  isArraySchema,
  isConstSchema,
  isEnumSchema,
  isNotSchema,
  isObjectSchema,
  isOneOfSchema,
  isSchemaWithMultipleTypes,
  isUnknownSchema,
} from '../internal/matchers'
import { isBoolean } from '../internal/utils'
import {
  parseAllOf,
  parseAnyOf,
  parseArray,
  parseConst,
  parseEnum,
  parseNot,
  parseObject,
  parseOneOf,
  parseTypeName,
  parseUnknown,
  parseWithMultipleTypes,
} from './parse'

/**
 * Takes the root schema and recursively collects the corresponding types
 * for it. Returns the matching typebox code representing the schema.
 *
 * @throws Error if an unexpected schema (one with no matching parser) was given
 */
export const collect = (schema: JSONSchema7Definition): string => {
  // TODO: boolean schema support..?
  if (isBoolean(schema)) {
    return JSON.stringify(schema)
  }
  if (isObjectSchema(schema)) {
    return parseObject(schema)
  }
  if (isEnumSchema(schema)) {
    return parseEnum(schema)
  }
  if (isAnyOfSchema(schema)) {
    return parseAnyOf(schema)
  }
  if (isAllOfSchema(schema)) {
    return parseAllOf(schema)
  }
  if (isOneOfSchema(schema)) {
    return parseOneOf(schema)
  }
  if (isNotSchema(schema)) {
    return parseNot(schema)
  }
  if (isArraySchema(schema)) {
    return parseArray(schema)
  }
  if (isSchemaWithMultipleTypes(schema)) {
    return parseWithMultipleTypes(schema)
  }
  if (isConstSchema(schema)) {
    return parseConst(schema)
  }
  if (isUnknownSchema(schema)) {
    return parseUnknown(schema)
  }
  if (schema.type !== undefined && !Array.isArray(schema.type)) {
    return parseTypeName(schema.type, schema)
  }

  throw new Error(
    `Unsupported schema. Did not match any type of the parsers. Schema was: ${JSON.stringify(
      schema
    )}`
  )
}
