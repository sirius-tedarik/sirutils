import { join } from 'node:path'
import { ResultAsync, unwrap, wrapAsync } from '@sirutils/core'

import { fileExists, getFileChecksum, readJsonFile } from '../internal/fs'
import { schemaTags } from '../tag'
import { generateJSONSchema } from './json-schema'

export const normalize = wrapAsync(
  async (schema: Sirutils.Schema.Original, filePath: string, dir: string, path: string[] = []) => {
    const normalized = { ...schema } as unknown as Sirutils.Schema.Normalized

    normalized.name = schema.name.toLowerCase().replaceAll(' ', '-')
    normalized.path = join(dir, filePath)
    normalized.targetPath = join(dir, '_', filePath.replace('.json', '.ts'))
    normalized.checksum = unwrap(await getFileChecksum(join(process.cwd(), normalized.path)))
    normalized.exists = unwrap(await fileExists(normalized.targetPath))

    const isCycleDetected = path.includes(normalized.name)

    if (!isCycleDetected && normalized.importMaps) {
      normalized.importMaps = Object.fromEntries(
        unwrap(
          await ResultAsync.combine(
            Object.entries(schema.importMaps).map(
              wrapAsync(async ([name, extendedPath]) => {
                const fileResult = unwrap(
                  await readJsonFile<Sirutils.Schema.Original>(join(dir, extendedPath))
                )
                const normalizedExtended = unwrap(
                  await normalize(fileResult, extendedPath, dir, [...path, normalized.name])
                )

                return [name, normalizedExtended]
              }, schemaTags.populateImportMaps)
            )
          )
        )
      )
    } else {
      normalized.importMaps = {}
    }

    if (isCycleDetected) {
      normalized.validator = {}
    } else {
      normalized.validator = unwrap(generateJSONSchema(normalized))
    }

    if (isCycleDetected) {
      // biome-ignore lint/nursery/noConsole: <explanation>
      console.warn(
        `[${schemaTags.cycleDetected}]: dont use cyclic references ! --- ${path.join('|')}`
      )
    }

    return normalized
  },
  schemaTags.normalize
)
