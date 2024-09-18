import { ProjectError, capsule, unwrap } from '../result/error'
import { coreTags } from '../tag'
import type { BlobType, EmptyType } from './common'

export type ExtractEnvsCallback<T extends EmptyType> = (envList: BlobType) => T
export type Target = 'bun' | 'node'

/**
 * The extractEnvs function retrieves environment variables based on the specified target
 * (either Bun.env or process.env) and validates them using a callback function,
 * throwing an error if any variable is invalid.
 * It returns the processed environment variables for further use.
 */
export const extractEnvs = capsule(
  <T extends EmptyType>(callback: ExtractEnvsCallback<T>, target: Target = 'bun') => {
    const selectedTarget: BlobType =
      target === 'bun' && typeof Bun !== 'undefined' ? Bun.env : process.env

    const result = callback(selectedTarget)

    for (const [key, value] of Object.entries(result)) {
      if (value === null || value === undefined) {
        unwrap(ProjectError.create(coreTags.env, `ENV.${key} is not valid`).asResult())
      }
    }

    return result
  },
  coreTags.env
)
