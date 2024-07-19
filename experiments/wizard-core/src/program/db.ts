import { createDB, createRedisCacher } from '@sirutils/driver-mysql'
import { Seql } from '@sirutils/seql'

import { all } from '../../schemas/_'
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
    schemas: all,
  },
  experimentCoreTags.db
)

{
  const result = await db.exec<'settings'>(
    Seql.query`UPDATE ${Seql.table('settings')} SET ${Seql.update({
      name: 'migration',
      data: { sa: Math.round(Math.random() * 100) },
      timestamp: new Date(),
    })} WHERE ${Seql.and({ id: 1 })}`
  )

  await result.commit()
}

{
  const result = await db.exec<'settings[]'>(
    Seql.query`SELECT * FROM ${Seql.table('settings')} WHERE ${Seql.and({ id: 1 })}`
  )

  // biome-ignore lint/nursery/noConsole: <explanation>
  console.log(result.data)
}
