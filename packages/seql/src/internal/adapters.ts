import { ENV } from './consts'

import { mysqlAdapter } from './adapters/mysql'
import { postgresAdapter } from './adapters/postgres'

export const adapters = {
  postgres: postgresAdapter,
  mysql: mysqlAdapter,
} as const

export const selectedAdapter = adapters[ENV.adapter]
