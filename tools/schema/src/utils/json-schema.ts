import _ from 'lodash'

import { ProjectError, unwrap, wrap } from '@sirutils/core'
import type { JSONSchema7 } from 'json-schema'

import { schemaTags } from '../tag'

const idTypes = ['ulid', 'uuid', 'incremental']
const basicTypes = ['string', 'number', 'integer', 'boolean', 'null']
const mappedTypes = {
  date: 'Date',
  bigint: 'BigInt',
  json: 'JSON',
  buffer: 'BufferType',
} as const

const omitProperties = ['name', 'attributed', 'required', 'type', 'fields']

export const generateJSONSchema = wrap((normalized: Sirutils.Schema.Normalized): JSONSchema7 => {
  const result: JSONSchema7 = {
    $id: normalized.name,
    title: normalized.name,

    type: 'object',

    properties: {},
    required: [],
  }

  let currList: Sirutils.Schema.Normalized['fields'] = [...normalized.fields]
  const nextLists: [string[], Sirutils.Schema.Normalized['fields']][] = []
  let currPath: string[] = ['properties']

  while (currList.length > 0) {
    const field = currList.shift()

    if (!field) {
      break
    }

    if (basicTypes.includes(field.type) || idTypes.includes(field.type)) {
      _.set(result, [...currPath, field.name], {
        ..._.omit(field, omitProperties),
        type: field.type,
      })
    } else if (_.has(mappedTypes, field.type)) {
      _.set(result, [...currPath, field.name], {
        ..._.omit(field, omitProperties),
        type: _.get(mappedTypes, field.type),
      })
    } else if (field.type === 'relation') {
      // TODO: relations
    } else {
      unwrap(
        ProjectError.create(schemaTags.invalidFieldType, `${field.name}: ${field.type}`).asResult()
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
}, schemaTags.generateJSONSchema)
