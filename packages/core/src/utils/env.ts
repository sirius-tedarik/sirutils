import { ProjectError, unwrap, wrap } from '../result/error'
import { coreTags } from '../tag'
import type { BlobType, EmptyType } from './common'

export type ExtractEnvsCallback<T extends EmptyType> = (envList: BlobType) => T
export type Target = 'bun' | 'node'

export const extractEnvs = wrap(
  <T extends EmptyType>(callback: ExtractEnvsCallback<T>, target: Target = 'bun') => {
    const selectedTarget: BlobType =
      target === 'bun' && typeof Bun !== 'undefined' ? Bun.env : process.env

    const result = callback(selectedTarget)

    for (const [key, value] of Object.entries(result)) {
      if (!value) {
        unwrap(ProjectError.create(coreTags.env, `ENV.${key} is not valid`).asResult())
      }
    }

    return result
  },
  coreTags.env
)
