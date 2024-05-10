import { ENV } from './env'

import { mysqlAdapter } from './adapters/mysql'
import { postgresAdapter } from './adapters/postgres'

export const adaptors = {
  postgres: postgresAdapter,
  mysql: mysqlAdapter,
} as const

export const selectedAdaptor = adaptors[ENV.adaptor]
