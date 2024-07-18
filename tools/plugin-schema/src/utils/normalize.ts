// biome-ignore lint/style/noNamespaceImport: Redundant
import * as path from 'node:path'

import { ResultAsync, unwrap, wrapAsync } from '@sirutils/core'
import { fileExists, getFileChecksum, readJsonFile } from '@sirutils/toolbox'

import { logger } from '../internal/logger'
import { schemaPluginTags } from '../tag'
import { generate } from './generate'
import { generateJSONSchema } from './json-schema'

export const normalize = wrapAsync(
  async (
    dir: string,
    filePath: string,
    schema: Sirutils.SchemaPlugin.Original,
    filePaths: string[] = []
  ) => {
    const normalized = { ...schema } as unknown as Sirutils.SchemaPlugin.Normalized

    normalized.name = schema.name.toLowerCase().replaceAll(' ', '-')
    normalized.path = path.join(dir, filePath)
    normalized.targetPath = path.join(dir, '_', filePath.replace('.json', '.ts'))
    normalized.checksum = unwrap(await getFileChecksum(path.join(process.cwd(), normalized.path)))
    normalized.exists = unwrap(await fileExists(normalized.targetPath))
    normalized.original = schema

    const isCycleDetected = filePaths.includes(normalized.name)

    if (!isCycleDetected && normalized.importMaps) {
      normalized.importMaps = Object.fromEntries(
        unwrap(
          await ResultAsync.combine(
            Object.entries(schema.importMaps).map(
              wrapAsync(async ([name, extendedPath]) => {
                const fileResult = unwrap(
                  await readJsonFile<Sirutils.SchemaPlugin.Original>(path.join(dir, extendedPath))
                )
                const normalizedExtended = unwrap(
                  await normalize(dir, extendedPath, fileResult, [...filePaths, normalized.name])
                )

                return [name, normalizedExtended]
              }, schemaPluginTags.populateImportMaps)
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
      normalized.code = await generate(normalized)
    }

    if (isCycleDetected) {
      logger.warn(
        `[${schemaPluginTags.cycleDetected}]: dont use cyclic references ! --- ${filePaths.join('|')}`
      )
    }

    return normalized
  },
  schemaPluginTags.normalize
)
