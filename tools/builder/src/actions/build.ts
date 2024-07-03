import { $ } from 'bun'
import type { Result } from 'meow'
import ora from 'ora'

import type { config } from '../utils/config'

export const build = async <T extends Sirutils.Builder.AnyFlags>(
  cli: Result<(typeof config)['cli']['flags']>,
  options: Sirutils.Builder.Options<T>
) => {
  const message = ora(`starting bundler at ${options.generated.projectName}`).start()

  try {
    await Promise.all([
      Bun.build({
        ...options.bundle,
        entrypoints: options.generated.entryPaths,
        external: options.generated.externals,
        outdir: options.generated.tmpDistPath,
        root: cli.flags.cwd,
      }),
      $`bun x tsc --project ./tsconfig.json --outDir ${options.generated.tmpDistPath}`,
    ])

    if (cli.flags.entrypoints.some(entrypoint => entrypoint.includes('src'))) {
      await $`cp -r ${options.generated.tmpDistPath}/src/* ${options.generated.distPath}`
    }

    const otherEntrypoints = cli.flags.entrypoints.filter(entrypoint => !entrypoint.includes('src'))

    if (otherEntrypoints.length > 0) {
      await Promise.all(
        otherEntrypoints.map(otherEntrypoint => {
          const dirName = otherEntrypoint.split('/')[0]

          return $`cp -r ${options.generated.tmpDistPath}/${dirName}/* ${options.generated.distPath}/${dirName}`
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
