// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as path from 'node:path'

import { config } from '@sirutils/builder'
import { readJsonFile, writeFile } from '@sirutils/toolbox'
import { $, Glob } from 'bun'

import { ResultAsync, unwrap, wrapAsync } from '@sirutils/core'
import { schemaPluginTags } from './tag'
import { normalize } from './utils/normalize'

export const pluginFlags = {
  ...config.cli.flags,

  force: {
    type: 'boolean' as const,
    shortFlag: 'f',
    default: false,
  },
  schema: {
    type: 'string' as const,
    shortFlag: 's',
    default: ['schemas'],
    isMultiple: true as const,
  },
}

export const plugin: Sirutils.Builder.Plugin<typeof pluginFlags> = config => {
  // biome-ignore lint/style/noNonNullAssertion: Redundant
  config.cli.flags!.schema = pluginFlags.schema
  // biome-ignore lint/style/noNonNullAssertion: Redundant
  config.cli.flags!.force = pluginFlags.force

  config.helpMessages.commands.unshift('$ sirbuilder schema -f')
  config.helpMessages.options.unshift("--schemas, -s schema entries, default to ['schemas']")
  config.helpMessages.options.unshift('--force, -f to force generating schema')

  config.actions.schema = async (cli, _options) => {
    const normalizedSchemas = [] as Sirutils.SchemaPlugin.Normalized[]

    for (const schemaDir of cli.flags.schema) {
      const glob = new Glob(`${schemaDir}/**/*.json`)
      const filePaths = await Array.fromAsync(glob.scan())

      const combined = unwrap(
        await ResultAsync.combine(
          filePaths.map(
            wrapAsync(async filePath => {
              const originalFilePath = path.relative(schemaDir, filePath)

              const jsonData = unwrap(await readJsonFile<Sirutils.SchemaPlugin.Original>(filePath))

              return unwrap(await normalize(schemaDir, originalFilePath, jsonData))
            }, schemaPluginTags.traverse)
          )
        )
      )

      normalizedSchemas.push(...combined)
    }

    for (const normalizedSchema of normalizedSchemas) {
      unwrap(await writeFile(normalizedSchema.targetPath, normalizedSchema.code))
    }

    await Promise.all(
      cli.flags.schema.map(schemaDir => {
        return $`bun x @biomejs/biome check --write --unsafe --no-errors-on-unmatched --files-ignore-unknown=true --config-path=${path.join(cli.flags.cwd, '../..')} ./${schemaDir}/**/*`.cwd(
          cli.flags.cwd
        )
      })
    )
  }

  return config
}
