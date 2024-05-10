import { Seql } from '../src'

export const childQuery = Seql.query`${Seql.and({
  name: 'ahmet',
  surname: 'eker',
})}`

export const query = Seql.query`SELECT * FROM users WHERE ${childQuery}`

// biome-ignore lint/nursery/noConsole: <explanation>
console.log('result query', query)
