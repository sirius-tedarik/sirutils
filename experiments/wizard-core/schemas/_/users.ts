import { ProjectError } from '@sirutils/core'
import { type Static, TypeCompiler, schemaTags, t } from '@sirutils/schema'

export type Users = Static<typeof type>
declare global {
  namespace Sirutils {
    namespace Schema {
      namespace Generated {
        interface Tables {
          users: Users
        }
      }
    }
  }
}
const type = t.Object(
  {
    id: t.String({ format: 'ulid' }),
    name: t.String({ maxLength: 255 }),
    surname: t.String({ maxLength: 255 }),
    age: t.Number(),
    isAdmin: t.Optional(t.Boolean()),
    attributes: t.Array(t.Object({ id: t.Number() }, { $id: 'attributes' }), { default: [] }),
  },
  { $id: 'users' }
)
const compiled = TypeCompiler.Compile(t.Array(type))
export const users = {
  type,
  compiled,
  schema: {
    $id: 'users',
    title: 'users',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'ulid' },
      name: { maxLength: 255, type: 'string' },
      surname: { maxLength: 255, type: 'string' },
      age: { type: 'number' },
      isAdmin: { type: 'boolean' },
      attributes: {
        default: [],
        type: 'array',
        items: {
          $id: 'attributes',
          title: 'attributes',
          type: 'object',
          properties: { id: { type: 'number' } },
          required: ['id'],
        },
      },
    },
    required: ['id', 'name', 'surname', 'age', 'attributes'],
  },
  orginal: {
    name: 'users',
    fields: [
      { name: 'id', type: 'ulid' },
      { name: 'name', type: 'string', maxLength: 255 },
      { name: 'surname', type: 'string', maxLength: 255 },
      { name: 'age', type: 'number', attributes: ['personal'] },
      { name: 'isAdmin', type: 'boolean', required: false },
      { name: 'attributes', type: 'array', default: [], fields: [{ name: 'id', type: 'number' }] },
    ],
    indexes: [{ name: 'idx', fields: ['id'] }],
  },
  check: (datas: Users[]) => {
    if (!compiled.Check(datas)) {
      ProjectError.create(schemaTags.invalidData, 'users')
        .appendData([...compiled.Errors(datas)])
        .throw()
    }

    return datas
  },
}
