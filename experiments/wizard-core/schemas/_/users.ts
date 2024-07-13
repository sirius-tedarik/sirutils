import { type Static, t } from '@sirutils/schema'

export type Users = Static<typeof users>
export const users = t.Object(
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
export const usersSchema = {
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
}
