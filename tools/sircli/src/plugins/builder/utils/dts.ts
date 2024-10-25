import { $ } from 'bun'
import { cp, exists, mkdir } from 'node:fs/promises'
import { basename, dirname, join, posix, sep } from 'node:path'

import type { Entries } from '../plugin'

export interface BuildDTSOptions {
  cwd: string
  entries: Entries[]
}

export const buildDts = async (options: BuildDTSOptions) => {
  if (options.entries.every(entry => !entry.types)) {
    return true
  }

  const tempDir = join(options.cwd, '.sircli', 'builder')

  if (!(await exists(tempDir))) {
    await mkdir(tempDir, {
      recursive: true,
    })
  }

  await $`bun x tsc --project ./tsconfig.json --outDir ${tempDir}`.cwd(options.cwd)

  const grouped = options.entries.reduce(
    (acc, curr) => {
      if (!curr.types) {
        return acc
      }

      const inputDir = dirname(curr.source)

      if (acc[inputDir]) {
        acc[inputDir].push(curr)
      } else {
        acc[inputDir] = [curr]
      }

      return acc
    },
    {} as Record<string, Entries[]>
  )

  await Promise.all(
    Object.entries(grouped).map(async ([inputDir, entries]) => {
      const trimmed = inputDir.slice(2)
      const splitted = trimmed.replaceAll(sep, posix.sep).split('/')

      const target = splitted.length === 1 ? 'index' : splitted.slice(1).join('/')
      const visited: string[] = []

      await Promise.all(
        entries.map(async entry => {
          // biome-ignore lint/style/noNonNullAssertion: Redundant
          const outDir = dirname(entry.types!)
          const typesDir = join(outDir, '.types', target)
          const absoluteTypesDir = join(options.cwd, typesDir)
          // biome-ignore lint/style/noNonNullAssertion: Redundant
          const filename = basename(entry.source!)

          if (!(await exists(absoluteTypesDir))) {
            await mkdir(absoluteTypesDir, {
              recursive: true,
            })
          }

          if (!visited.includes(absoluteTypesDir)) {
            visited.push(absoluteTypesDir)

            await cp(`${join(tempDir, inputDir)}`, absoluteTypesDir, {
              recursive: true,
              errorOnExist: false,
              force: true,
            })
          }

          await Bun.write(
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            join(options.cwd, entry.types!),
            `export * from './${join('.types', target, filename)}'`
          )
        })
      )
    })
  )
}
