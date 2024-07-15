import os from 'node:os'
import path from 'node:path'

import { extractEnvs } from '@sirutils/core'

export const ENV = extractEnvs<Sirutils.Env>(env => ({
  target: env.TARGET ?? typeof Bun === 'undefined' ? 'node' : 'bun',
  mode: env.MODE ?? 'prod',
  errors: env.MODE === 'prod' ? 'hash' : env.ERRORS ?? 'hash',
  errorConfigPath: env.ERROR_CONFIG_PATH ?? path.join(os.homedir(), '.wizard.errors.json'),
}))
