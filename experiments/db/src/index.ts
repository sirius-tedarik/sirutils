import '../schemas/_'

import s2t from 'schema2typebox'

// biome-ignore lint/nursery/noConsole: <explanation>
console.log(
  await s2t.schema2typebox({
    input: JSON.stringify({
      title: 'Person',
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 20,
        },
        age: {
          type: 'number',
          minimum: 18,
          maximum: 90,
        },
        hobbies: {
          type: 'array',
          minItems: 1,
          items: {
            title: 'Tobby',
            type: 'object',
            properties: {
              name: {
                type: 'string',
                maxLength: 100,
              },
              age: {
                type: 'number',
                minimum: 18,
              },
            },
            required: ['name', 'age'],
          },
        },
        favoriteAnimal: {
          enum: ['dog', 'cat', 'sloth'],

          attributes: ['sa'],
        },
      },
      required: ['name', 'age', 'favoriteAnimal'],
    }),
  })
)
