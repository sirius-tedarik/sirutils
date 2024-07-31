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
