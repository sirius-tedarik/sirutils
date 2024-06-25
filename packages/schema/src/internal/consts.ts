import { extractEnvs } from '@sirutils/core'

export const ENV = extractEnvs<Sirutils.Schema.Env>(env => ({
  adapter: env.SEQL_ADAPTER || 'mysql',
  console: env.CONSOLE || 'normal',
}))
