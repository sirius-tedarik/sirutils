import { createDB, createRedisCacher } from '@sirutils/driver-mysql'
import { Seql } from '@sirutils/seql'

import { experimentCoreTags } from '../tag'

export const cacher = createRedisCacher({
  prefix: 'testdb',
})

export const db = await createDB(
  {
    cacher,
    connectionOptions: {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'secret',
      database: 'test',
    },
  },
  experimentCoreTags.db
)

const result = await db.exec<'settings[]'>(
  Seql.query`SELECT * FROM ${Seql.table('settings')} WHERE ${Seql.and({ id: 1 })}`
)

// biome-ignore lint/nursery/noConsole: <explanation>
console.log(result.data)

// const result = await db.exec<'settings'>(
//   Seql.query`INSERT INTO settings ${Seql.insert([
//     {
//       id: 1,
//       name: 'migration',
//       data: Seql.json({ sa: 4 }),
//       timestamp: dayjs.utc().format('YYYY-MM-DD HH:MM:ss'),
//     },
//   ])}`
// )

// await result.commit()
