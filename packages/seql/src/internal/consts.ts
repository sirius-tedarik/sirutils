import { extractEnvs, unwrap } from '@sirutils/core'

export const ENV = unwrap(
  extractEnvs<Sirutils.Seql.Env>(env => ({
    adaptor: env.SEQL_ADAPTOR || 'mysql',
  }))
)

export const Raw = Symbol('Raw Query')
export const Generated = Symbol('Generated Query')
