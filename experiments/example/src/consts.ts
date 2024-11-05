import { extractEnvs } from '@sirutils/std/io'

export const ENV = extractEnvs(env => ({
  host: env.HOST,
}))
