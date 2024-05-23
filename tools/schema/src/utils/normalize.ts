import { join } from 'node:path'
import {
  type BlobType,
  ProjectError,
  Result,
  ResultAsync,
  unwrap,
  wrap,
  wrapAsync,
} from '@sirutils/core'

import { fileExists, getFileChecksum, readJsonFile } from '../internal/fs'
import { schemaTags } from '../tag'

const basicTypes = ['string', 'number', 'boolean', 'null', 'bigint'] as const
const idTypes = ['ulid', 'uuid', 'incremental']

export const normalizeFields = wrap(
  (
    field: Sirutils.Schema.Original['fields'][number],
    normalizedSchema: Sirutils.Schema.Normalized,
    path = []
  ): Sirutils.Schema.Normalized['fields'][number] => {
    let targetType: string | null = null

    if (field.type === 'reference') {
      const targetSchema =
        normalizedSchema.importMaps[field.to as keyof (typeof normalizedSchema)['importMaps']]
      if (!targetSchema || typeof field.mode === 'undefined') {
        return unwrap(
          ProjectError.create(
            schemaTags.invalidField,
            `${field.name} is missing .to or .mode`
          ).asResult()
        )
      }

      if (field.mode === 'multiple' && typeof field.defaults === 'undefined') {
        field.defaults = []
      }

      if (field.mode === 'single') {
        field.required = true
      }

      const targetInterfaceName = `${targetSchema.name
        .at(0)
        ?.toUpperCase()}${targetSchema.name.slice(1)}`

      targetType = `Sirutils.Schema.Generated.${targetInterfaceName}${
        field.mode === 'multiple' ? '[]' : ''
      }`
    } else if (basicTypes.includes(field.type as BlobType)) {
      targetType = field.type
    } else if (idTypes.includes(field.type as BlobType)) {
      targetType = 'string'
    }

    if (targetType === null) {
      unwrap(ProjectError.create(schemaTags.invalidField, `${field.name} is invalid`).asResult())
    }

    return {
      ...field,

      required: typeof field.required === 'undefined' ? true : field.required,
      defaults: field.defaults,

      // biome-ignore lint/style/noNonNullAssertion: Redundant
      targetType: targetType!,
    }
  },
  schemaTags.normalizeFields
)

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

    normalized.fields = unwrap(
      Result.combine(
        normalized.fields.map(field => normalizeFields(field, normalized, [schema.name]))
      )
    )

    return normalized
  },
  schemaTags.normalize
)
