import { extractEnvs } from '@sirutils/core'

export const ENV = extractEnvs<Sirutils.Env>(env => ({
  target: (env.TARGET ?? typeof Bun === 'undefined') ? 'node' : 'bun',
}))
