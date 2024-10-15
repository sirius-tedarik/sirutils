import { extractEnvs } from '@sirutils/core'

export const ENV = extractEnvs<Sirutils.Env>(env => ({
  console: env.CONSOLE || 'normal',
}))

export const DEFAULT_TTL = 60 * 60 * 24 // 1 day
