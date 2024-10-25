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

  // await Promise.all(
  //   options.entries.map(async entry => {
  //     if (!entry.types) {
  //       return
  //     }

  //     const outputPath = join(options.cwd, entry.types)
  //     const absoluteOutputDir = dirname(outputPath)
  //     const typesDir = join(absoluteOutputDir, '.types', entry.name)

  //     const splittedSource = entry.source.slice(2).split(SEPARATOR)
  //     splittedSource[0] = './.types'

  //     if (!(await exists(typesDir))) {
  //       await mkdir(typesDir, {
  //         recursive: true,
  //       })
  //     }

  //     const inputDir = dirname(entry.source)

  //     await cp(`${join(tempDir, inputDir)}`, typesDir, {
  //       recursive: true,
  //       errorOnExist: false,
  //       force: true,
  //     })
  //     await Bun.write(
  //       join(options.cwd, entry.types),
  //       `export * from '${splittedSource.join(SEPARATOR)}'`
  //     )
  //   })
  // )

  // await unlink(absoluteTempDir)

  /*
  const targetTempDir = `sirutils-${Date.now()}`
  const absoluteTempDir = join(tmpdir(), targetTempDir)

  await mkdir(absoluteTempDir, {
    recursive: true,
  })

  await $`bun x tsc --project ./tsconfig.json --outDir ${absoluteTempDir}`.cwd(options.cwd)

  const uniqueOutputs = options.entries.reduce(acc => {
    return acc
  }, [] as Entries[])

  const visited: string[] = []

  await Promise.all(
    options.entries.map(async entry => {
      const outputDir = dirname(entry.default)
      const targetPath = join(options.cwd, outputDir, '_types', entry.name)

      if (!(await exists(targetPath))) {
        await mkdir(targetPath, { recursive: true })
      }

      return true
    })
  )

  for (const entry of options.entries) {
    const inputDir = dirname(entry.source)
    const outputDir = dirname(entry.default)

    if (visited.includes(outputDir)) {
      return true
    }

    visited.push(outputDir)

    // TODO: check if cp replaces the content
    return await $`cp -${RECURSIVE_FLAG} ${join(absoluteTempDir, inputDir)}/* ${outputDir}/${entry.name}`.cwd(
      options.cwd
    )
  }
  */
}
