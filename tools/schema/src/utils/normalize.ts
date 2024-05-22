import { join } from 'node:path'
import { ResultAsync, unwrap, wrapAsync } from '@sirutils/core'

import { fileExists, getFileChecksum, readJsonFile } from '../internal/fs'
import { schemaTags } from '../tag'

export const normalize = wrapAsync(
  async (schema: Sirutils.Schema.Original, path: string, dir: string) => {
    const normalized = { ...schema } as unknown as Sirutils.Schema.Normalized

    normalized.path = join(dir, path)
    normalized.targetPath = join(dir, '_', path.replace('.json', '.ts'))
    normalized.checksum = unwrap(await getFileChecksum(join(process.cwd(), normalized.path)))
    normalized.exists = unwrap(await fileExists(normalized.targetPath))

    if (normalized.importMaps) {
      normalized.importMaps = Object.fromEntries(
        unwrap(
          await ResultAsync.combine(
            Object.entries(schema.importMaps).map(
              wrapAsync(async ([name, extendedPath]) => {
                const fileResult = unwrap(
                  await readJsonFile<Sirutils.Schema.Original>(join(dir, extendedPath))
                )
                const normalizedExtended = unwrap(await normalize(fileResult, extendedPath, dir))

                return [name, normalizedExtended]
              }, schemaTags.populateImportMaps)
            )
          )
        )
      )
    } else {
      normalized.importMaps = {}
    }

    return normalized
  },
  schemaTags.normalize
)
