import { createDB, createRedisCacher } from '@sirutils/driver-mysql'

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

await db.migrate()
