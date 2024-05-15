import { Seql } from '../src'
import { generateCacheKey } from '../src/utils/generater'

export const query = Seql.query`SELECT * FROM users WHERE ${Seql.or([
  Seql.and({
    name: 'ahmet',
    surname: 'eker',
  }),
  Seql.and({
    name: 'fatih',
    surname: 'yıldırım',
  }),
  Seql.and({
    name: 'volkan',
    surname: 'moğol',
  }),
])}`

// biome-ignore lint/nursery/noConsole: <explanation>
console.log('result query', query, generateCacheKey(query))
