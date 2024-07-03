import type { JSONSchema7Definition } from 'json-schema'

import { isBoolean } from '../internal/utils'

/**
 * Creates the imports required to build the typebox code.
 * Unused imports (e.g. if we don't need to create a TypeRegistry for OneOf
 * types) are stripped in a postprocessing step.
 */
export const createImportStatements = () => {
  return ['import { t, type Static } from "@sirutils/schema";'].join('\n')
}

export const createExportNameForSchema = (schema: JSONSchema7Definition) => {
  if (isBoolean(schema)) {
    return 'T'
  }
  return schema.title ?? 'T'
}

/**
 * Creates custom typebox code to support the JSON schema keyword 'oneOf'. Based
 * on the suggestion here: https://github.com/xddq/schema2typebox/issues/16#issuecomment-1603731886
 */
export const createOneOfTypeboxSupportCode = (): string => {
  return [
    "TypeRegistry.Set('ExtendedOneOf', (schema: any, value) => 1 === schema.oneOf.reduce((acc: number, schema: any) => acc + (Value.Check(schema, value) ? 1 : 0), 0))",
    "const OneOf = <T extends TSchema[]>(oneOf: [...T], options: SchemaOptions = {}) => Type.Unsafe<Static<TUnion<T>>>({ ...options, [Kind]: 'ExtendedOneOf', oneOf })",
  ].reduce((acc, curr) => {
    return `${acc + curr}\n\n`
  }, '')
}

/**
 * @throws Error
 */
export const createExportedTypeForName = (exportedName: string) => {
  if (exportedName.length === 0) {
    throw new Error("Can't create exported type for a name with length 0.")
  }
  const typeName = `${exportedName.charAt(0).toUpperCase()}${exportedName.slice(1)}`
  return `export type ${typeName} = Static<typeof ${exportedName}>`
}
