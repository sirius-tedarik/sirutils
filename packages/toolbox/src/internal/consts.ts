import { extractEnvs, unwrap } from '@sirutils/core'

export const ENV = unwrap(
  extractEnvs<Sirutils.Toolbox.Env>(env => ({
    target: env.target ?? typeof Bun === 'undefined' ? 'node' : 'bun',
  }))
)
