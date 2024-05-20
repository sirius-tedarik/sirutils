import { join } from 'path'
import { existsSync, mkdirSync } from 'node:fs'

import type { BunPlugin } from 'bun'

export const definitionGeneratorPlugin: BunPlugin = {
  name: 'Definition Generator Plugin',
  async setup(build) {
    const entrypoints = [...build.config.entrypoints].sort()

    const outDir = build.config.outdir || './dist'
    if (!existsSync(outDir)) {
      mkdirSync(outDir)
    }

    await Promise.all(
      entrypoints.map(entry => {
        const srcFile = entry.replace(/^.*\//, '')
        const dtsFile = srcFile.replace(/\.[jtm]s$/, '.d.ts')
        const outFile = join(outDir, dtsFile)

        return Bun.write(outFile, `export * from "../src/${srcFile}"`)
      })
    )
  },
}
