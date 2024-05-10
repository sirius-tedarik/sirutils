import { extractEnvs, unwrap } from '@sirutils/core'

export const ENV = unwrap(
  extractEnvs<Sirutils.Seql.Env>(env => ({
    adapter: env.SEQL_ADAPTER || 'mysql',
  }))
)

export const Raw = Symbol('Raw Query')
export const Generated = Symbol('Generated Query')
