import { $, type BuildOutput } from 'bun'
import type { Result } from 'meow'
import ora from 'ora'

import type { config } from '../utils/config'

export const build = async <T extends Sirutils.Builder.AnyFlags>(
  cli: Result<(typeof config)['cli']['flags']>,
  options: Sirutils.Builder.Options<T>
) => {
  const message = ora(`starting bundler at ${options.generated.projectName}`).start()

  try {
    /*
     * Building by dividing into groups of source files
     * for dont get any Bun error on Windows
     * because of "index out of bounds"
     *
     * This method also increase building speed
     */
    const builds: Promise<BuildOutput>[] = []

    options.generated.entryPaths.forEach((_path, index, paths) => {
      // Converting index to normal for algorithm logic
      const normal = index + 1

      // Building by group of 5 or less source files
      if (normal % 5 === 0 || index === paths.length - (paths.length % 5)) {
        const pathsStartIndex = normal - (normal % 5 || 5)
        const entrypoints = paths.slice(pathsStartIndex, normal)

        builds.push(
          Bun.build({
            ...options.bundle,
            entrypoints: [...entrypoints],
            external: options.generated.externals,
            outdir: options.generated.tmpDistPath,
            root: cli.flags.cwd,
          })
        )
      }
    })

    await Promise.all([
      ...builds,
      $`bun x tsc --project ./tsconfig.json --outDir ${options.generated.tmpDistPath}`,
    ])

    // Recursive flag my differ according to platfom
    const recursiveFlag = options.platform === 'win32' ? 'R' : 'r'

    if (cli.flags.entrypoints.some(entrypoint => entrypoint.includes('src'))) {
      await $`cp -${recursiveFlag} ${options.generated.tmpDistPath}/src/* ${options.generated.distPath}`
    }

    const otherEntrypoints = cli.flags.entrypoints.filter(entrypoint => !entrypoint.includes('src'))

    if (otherEntrypoints.length > 0) {
      await Promise.all(
        otherEntrypoints.map(otherEntrypoint => {
          const dirName = otherEntrypoint.split('/')[0]

          return $`cp -${recursiveFlag} ${options.generated.tmpDistPath}/${dirName}/* ${options.generated.distPath}/${dirName}`
        })
      )
    }

    message.stop()
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (err: any) {
    message.fail()

    // biome-ignore lint/nursery/noConsole: <explanation>
    console.error(err)

    process.exit(1)
  }
}
