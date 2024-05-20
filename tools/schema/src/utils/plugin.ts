import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { unwrap } from '@sirutils/core'
import type { BunPlugin } from 'bun'

import { traverse } from './traverse'

export interface SchemaGeneratorPluginConfig {
  dir?: string
}

export const schemaGeneratorPlugin = (config: SchemaGeneratorPluginConfig): BunPlugin => {
  return {
    name: 'schema-generator-plugin',
    async setup(build) {
      const outDir = build.config.outdir || './dist'
      if (!existsSync(outDir)) {
        mkdirSync(outDir)
      }

      const missingFiles = unwrap(await traverse(config.dir ?? join(process.cwd(), 'schemas')))

      // biome-ignore lint/nursery/noConsole: <explanation>
      console.log(missingFiles)
    },
  }
}
