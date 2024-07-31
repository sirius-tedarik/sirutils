import { type Jsonify, type ProjectError, unwrap, wrap, wrapAsync } from '@sirutils/core'
import { fileExists, readJsonFile, writeJsonFile } from '@sirutils/toolbox'

import { wizardTags } from '../tag'
import { ENV } from './consts'
import { logger } from './logger'

export const importErrorConfig = wrapAsync(async () => {
  const exists = unwrap(await fileExists(ENV.errorConfigPath))

  if (!exists) {
    unwrap(await writeJsonFile(ENV.errorConfigPath, {}, true))
  }

  const data = unwrap(
    await readJsonFile<Record<string, Jsonify<ProjectError>>>(ENV.errorConfigPath)
  )

  const idx = setInterval(async () => {
    unwrap(await writeJsonFile(ENV.errorConfigPath, data, true))
  }, 10000)

  return {
    discover: wrap((code: string, error: Sirutils.ProjectErrorType) => {
      if (Object.hasOwn(data, code)) {
        return
      }

      logger.warn(`discovered hash: ${code}`)
      data[code] = JSON.parse(error.stringify())
    }, wizardTags.discover),

    teardown: wrapAsync(async () => {
      clearInterval(idx)

      unwrap(await writeJsonFile(ENV.errorConfigPath, data, true))
    }),
  }
}, wizardTags.importErrorConfig)
