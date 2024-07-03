import { ProjectError, unwrap, wrap } from '@sirutils/core'
import type { JSONSchema7 } from 'json-schema'
import { get, has, omit, set } from '../internal/utils'
import { schemaPluginTags } from '../tag'

const idTypes = ['ulid', 'uuid', 'incremental']
const basicTypes = ['string', 'number', 'integer', 'boolean', 'null']
const complexTypes = ['object', 'array']

// TODO: implement mappedTypes in generateJSONSchema and @sirutils/schema
const mappedTypes = {
  date: 'Date',
  bigint: 'BigInt',
  json: 'JSON',
  buffer: 'BufferType',
} as const

const omitProperties = ['name', 'attributes', 'required', 'type', 'fields', 'mode', 'to']

export const generateJSONSchema = wrap(
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Redundant
  (normalized: Sirutils.SchemaPlugin.Normalized): JSONSchema7 => {
    const result: JSONSchema7 = {
      $id: normalized.name,
      title: normalized.name,

      type: 'object',

      properties: {},
      required: [],
    }

    let currList: Sirutils.SchemaPlugin.Normalized['fields'] = [...normalized.fields]
    const nextLists: [string[], Sirutils.SchemaPlugin.Normalized['fields']][] = []
    let currPath: string[] = ['properties']

    while (currList.length > 0) {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const field = currList.shift()!

      if (basicTypes.includes(field.type)) {
        set(result, [...currPath, field.name], {
          ...omit(field, omitProperties),
          type: field.type,
        })
      } else if (idTypes.includes(field.type)) {
        set(result, [...currPath, field.name], {
          ...omit(field, omitProperties),
          type: 'string',
          format: field.type,
        })
      } else if (has(mappedTypes, field.type)) {
        set(result, [...currPath, field.name], {
          ...omit(field, omitProperties),
          type: get(mappedTypes, field.type),
        })
      } else if (field.type === 'relation') {
        if (typeof field.mode === 'undefined' || typeof field.to === 'undefined') {
          return unwrap(
            ProjectError.create(
              schemaPluginTags.invalidFieldType,
              `${field.name}: ${field.type}, mode and to is required`
            ).asResult()
          )
        }

        const targetSchema = normalized.importMaps[field.to]

        if (!targetSchema) {
          return unwrap(
            ProjectError.create(
              schemaPluginTags.invalidFieldType,
              `${field.name}: ${field.type}, cannot found ${field.to} in importMaps`
            ).asResult()
          )
        }

        set(result, [...currPath, field.name], {
          ...omit(field, omitProperties),

          type: field.mode === 'single' ? 'object' : 'array',
          ...(field.mode === 'single'
            ? { $id: field.name, title: field.name, properties: {}, required: [] }
            : {
                items: {
                  $id: field.name,
                  title: field.name,
                  type: 'object',
                  properties: {},
                  required: [],
                },
              }),
        })

        if (field.mode === 'multiple') {
          nextLists.push([
            [...currPath, field.name, 'items', 'properties'],
            [...targetSchema.fields],
          ])
        } else {
          nextLists.push([[...currPath, field.name, 'properties'], [...targetSchema.fields]])
        }
      } else if (complexTypes.includes(field.type)) {
        if (typeof field.fields === 'undefined') {
          return unwrap(
            ProjectError.create(
              schemaPluginTags.invalidFieldType,
              `${field.name}: ${field.type}, mode and to is required`
            ).asResult()
          )
        }

        set(result, [...currPath, field.name], {
          ...omit(field, omitProperties),

          type: field.type,
          ...(field.type === 'object'
            ? { $id: field.name, title: field.name, properties: {}, required: [] }
            : {
                items: {
                  $id: field.name,
                  title: field.name,
                  type: 'object',
                  properties: {},
                  required: [],
                },
              }),
        })

        if (field.type === 'array') {
          nextLists.push([[...currPath, field.name, 'items', 'properties'], [...field.fields]])
        } else {
          nextLists.push([[...currPath, field.name, 'properties'], [...field.fields]])
        }
      } else {
        unwrap(
          ProjectError.create(
            schemaPluginTags.invalidFieldType,
            `${field.name}: ${field.type}`
          ).asResult()
        )
      }

      if (typeof field.required === 'undefined' || field.required) {
        const targetPath = [...currPath.slice(0, -1), 'required']

        set(
          result,
          [...targetPath, get(result, [...currPath.slice(0, -1), 'required']).length],
          field.name
        )
      }

      if (currList.length === 0 && nextLists.length > 0) {
        // biome-ignore lint/style/noNonNullAssertion: Redundant
        const [newPath, newList] = nextLists.shift()!

        currPath = newPath
        currList = newList
      }
    }

    return result
  },
  schemaPluginTags.generateJSONSchema
)
