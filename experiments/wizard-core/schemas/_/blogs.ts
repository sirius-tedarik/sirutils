import { type Static, t } from '@sirutils/schema'

export type Blogs = Static<typeof blogs>
export const blogs = t.Object(
  {
    id: t.String(),
    author: t.Optional(
      t.Object(
        {
          id: t.String({ format: 'ulid' }),
          name: t.String({ maxLength: 255 }),
          surname: t.String({ maxLength: 255 }),
          age: t.Number(),
          isAdmin: t.Optional(t.Boolean()),
          attributes: t.Array(t.Object({ id: t.Number() }, { $id: 'attributes' }), { default: [] }),
        },
        { $id: 'author' }
      )
    ),
    viewers: t.Optional(
      t.Union([
        t.Array(t.String()),
        t.Array(
          t.Object(
            {
              id: t.String({ format: 'ulid' }),
              name: t.String({ maxLength: 255 }),
              surname: t.String({ maxLength: 255 }),
              age: t.Number(),
              isAdmin: t.Optional(t.Boolean()),
              attributes: t.Array(t.Object({ id: t.Number() }, { $id: 'attributes' }), {
                default: [],
              }),
            },
            { $id: 'viewers' }
          ),
          { defaults: [] }
        ),
      ])
    ),
  },
  { $id: 'blogs' }
)
export const blogsSchema = {
  $id: 'blogs',
  title: 'blogs',
  type: 'object',
  properties: {
    id: { type: 'string' },
    author: {
      type: 'object',
      $id: 'author',
      title: 'author',
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
    viewers: {
      anyOf: [
        { type: 'array', items: { type: 'string' } },
        {
          defaults: [],
          type: 'array',
          items: {
            $id: 'viewers',
            title: 'viewers',
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
        },
      ],
    },
  },
  required: ['id'],
}
