import $Refparser from '@apidevtools/json-schema-ref-parser'
import type { JSONSchema7Definition } from 'json-schema'

import { collect } from './collect'
import {
  createExportNameForSchema,
  createExportedTypeForName,
  createImportStatements,
  createOneOfTypeboxSupportCode,
} from './create'

/** Generates TypeBox code from a given JSON schema */
export const generate = async (normalized: Sirutils.SchemaPlugin.Normalized) => {
  const schemaObj =
    typeof normalized.validator === 'string'
      ? JSON.parse(normalized.validator)
      : normalized.validator

  const dereferencedSchema = (await $Refparser.dereference(
    schemaObj
  )) as unknown as JSONSchema7Definition

  const exportedName = createExportNameForSchema(dereferencedSchema)
  // Ensuring that generated typebox code will contain an '$id' field.
  // see: https://github.com/xddq/schema2typebox/issues/32
  if (typeof dereferencedSchema !== 'boolean' && dereferencedSchema.$id === undefined) {
    dereferencedSchema.$id = exportedName
  }

  const typeBoxType = collect(dereferencedSchema)
  const exportedType = createExportedTypeForName(exportedName)

  return `${createImportStatements()}

${typeBoxType.includes('OneOf([') ? createOneOfTypeboxSupportCode() : ''}
${exportedType}
declare global {
  namespace Sirutils {
    namespace Schema {
      namespace Generated {
        interface Tables {
          ${exportedName}: ${exportedName.charAt(0).toUpperCase()}${exportedName.slice(1)}
        }
      }
    }
  }
}
const type = ${typeBoxType}
const compiled = TypeCompiler.Compile(t.Array(type))
export const ${exportedName} = {
  type,
  compiled,
  schema: ${JSON.stringify(normalized.validator)},
  orginal: ${JSON.stringify(normalized.original)},
  check: (datas: ${exportedName.charAt(0).toUpperCase()}${exportedName.slice(1)}[]) => {
    if(!compiled.Check(datas)) {
      ProjectError.create(schemaTags.invalidData, '${exportedName}').appendData([...compiled.Errors(datas)]).throw()
    }

    return datas
  }
}`
}
