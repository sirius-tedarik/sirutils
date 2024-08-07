import { extractEnvs } from '@sirutils/core'

export const ENV = extractEnvs<Sirutils.Env>(env => ({
  console: env.CONSOLE || 'normal',
}))
