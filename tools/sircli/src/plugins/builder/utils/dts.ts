import { $ } from 'bun'
import { mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { RECURSIVE_FLAG } from '../../../internal/consts'
import type { Entries } from '../plugin'

export interface BuildDTSOptions {
  cwd: string
  entries: Entries[]
}

export const buildDts = async (options: BuildDTSOptions) => {
  const targetTempDir = `sirutils-${Date.now()}`
  const absoluteTempDir = join(tmpdir(), targetTempDir)

  await mkdir(absoluteTempDir, {
    recursive: true,
  })

  await $`bun x tsc --project ./tsconfig.json --outDir ${absoluteTempDir}`.cwd(options.cwd)

  const visited: string[] = []

  for (const entry of options.entries) {
    const inputDir = dirname(entry.source)
    const outputDir = dirname(entry.default)

    if (visited.includes(outputDir)) {
      return true
    }

    visited.push(outputDir)

    // TODO: check if cp replaces the content
    return await $`cp -${RECURSIVE_FLAG} ${join(absoluteTempDir, inputDir)}/* ${outputDir}`.cwd(
      options.cwd
    )
  }
}
