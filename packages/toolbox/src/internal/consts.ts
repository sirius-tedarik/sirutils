import { extractEnvs } from '@sirutils/core'

export const ENV = extractEnvs<Sirutils.Toolbox.Env>(env => ({
  target: env.TARGET ?? typeof Bun === 'undefined' ? 'node' : 'bun',
}))
