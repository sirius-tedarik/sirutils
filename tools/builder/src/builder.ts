import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { $, type BuildConfig, Glob } from 'bun'
import meow from 'meow'

import { config } from './config'
import { readJsonFile, utils } from './internal/utils'

import { build } from './actions/build'

export const createBuilder = <T extends Sirutils.Builder.AnyFlags>(
  options?: Sirutils.Builder.Options<T>,
  plugins: Sirutils.Builder.Plugin[] = []
) => {
  return async () => {
    const mergedConfig = Object.assign(
      {},
      config,
      options,
      ...plugins.map(plugin => plugin(utils))
    ) as Sirutils.Builder.Options<T>

    const cli = meow(
      mergedConfig.helpMessage,
      mergedConfig.cli as unknown as (typeof config)['cli']
    )

    if (cli.input.length === 0 || cli.flags.help) {
      cli.showHelp()

      return
    }

    mergedConfig.bundle.entrypoints = cli.flags.entrypoints
    mergedConfig.bundle.outdir = cli.flags.outdir
    mergedConfig.bundle.sourcemap = cli.flags.sourcemap as Exclude<
      BuildConfig['sourcemap'],
      undefined
    >
    mergedConfig.bundle.target = cli.flags.target as Exclude<BuildConfig['target'], undefined>

    if (!cli.flags.minify) {
      Reflect.deleteProperty(mergedConfig.bundle, 'minify')
    }

    const externals: string[] = cli.flags.externals

    if (cli.flags.externalAll) {
      const pkg = await readJsonFile(path.join(cli.flags.cwd, './package.json'))

      externals.push(
        ...Object.keys(pkg.dependencies ?? {}),
        ...Object.keys(pkg.devDependencies ?? {}),
        ...Object.keys(pkg.peerDependencies ?? {})
      )
    }

    mergedConfig.generated = {
      projectName: cli.flags.cwd.split('/').slice(-2).join('/'),
      distPath: path.join(cli.flags.cwd, cli.flags.outdir),
      tmpDistPath: path.join(
        os.tmpdir(),
        `sirutils/${cli.flags.cwd.split('/').slice(-2).join('/')}/${Date.now()}`
      ),
      entryPaths: cli.flags.entrypoints.reduce((acc, curr) => {
        const glob = new Glob(curr)

        acc.push(...glob.scanSync(cli.flags.cwd))

        return acc
      }, [] as string[]),
      externals,
    }

    await fs.mkdir(mergedConfig.generated.distPath, {
      recursive: true,
    })

    await fs.mkdir(mergedConfig.generated.tmpDistPath, {
      recursive: true,
    })

    if (cli.input.includes('build')) {
      await build(cli, mergedConfig)
    }

    await $`rm -rf ${mergedConfig.generated.tmpDistPath}`
  }
}
