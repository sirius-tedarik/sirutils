import { type Static, t } from '@sirutils/schema'

export type Blogs = Static<typeof blogs>
export const blogs = t.Object(
  {
    id: t.String(),
    author: t.Object(
      {
        id: t.String({ format: 'ulid' }),
        name: t.String({ maxLength: 255 }),
        surname: t.String({ maxLength: 255 }),
        age: t.Number(),
        isAdmin: t.Optional(t.Boolean()),
        attributes: t.Array(t.Object({ id: t.Number() }, { $id: 'attributes' }), { default: [] }),
      },
      { $id: 'author' }
    ),
    viewers: t.Array(
      t.Object(
        {
          id: t.String({ format: 'ulid' }),
          name: t.String({ maxLength: 255 }),
          surname: t.String({ maxLength: 255 }),
          age: t.Number(),
          isAdmin: t.Optional(t.Boolean()),
          attributes: t.Array(t.Object({ id: t.Number() }, { $id: 'attributes' }), { default: [] }),
        },
        { $id: 'viewers' }
      ),
      { defaults: [] }
    ),
  },
  { $id: 'blogs' }
)
