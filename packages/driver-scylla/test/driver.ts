import { extractEnvs } from '@sirutils/core'

import { createScyllaDriver } from '../src'
import { logger } from '../src/internal/logger'

export const ENV = extractEnvs<Sirutils.DriverScylla.Env>(env => ({
  scyllaContactPoints: env.SCYLLA_CONTACT_POINTS?.split(','),
  scyllaLocalDataCenter: env.SCYLLA_LOCAL_DATA_CENTER,
  scyllaPassword: env.SCYLLA_PASSWORD,
  scyllaUsername: env.SCYLLA_USERNAME,
}))

export const driver = await createScyllaDriver({
  client: {
    contactPoints: ENV.scyllaContactPoints,
    localDataCenter: ENV.scyllaLocalDataCenter,
    credentials: { username: ENV.scyllaUsername, password: ENV.scyllaPassword },
  },
})

const query = driver.api
  .query`SELECT ${driver.api.columns()} FROM ${driver.api.table('users')} WHERE ${driver.api.and([
  {
    name: 'alice',
  },
])}`

logger.info(query)

const updateQuery = driver.api.query`UPDATE SET name = ${'yui'} WHERE ${driver.api.and([
  {
    name: 'alice',
  },
])}`

logger.info(updateQuery)

// for (const row of await driver.api.exec`DESCRIBE TABLES`) {
//   logger.info(row)
// }

await driver.api.$client.shutdown()
