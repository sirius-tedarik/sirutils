import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { $, type BuildConfig, Glob } from 'bun'
import meow from 'meow'

import { config } from './config'
import { readJsonFile, utils } from './other'

import { build } from '../actions/build'
import { createHelpMessage } from './help-message'

export const createBuilder = <T extends Sirutils.Builder.AnyFlags>(
  options?: Sirutils.Builder.Options<T>
) => {
  return async () => {
    const mergedConfig = Object.assign({}, config, options) as Sirutils.Builder.Options<T>

    const cli = meow(
      createHelpMessage(
        mergedConfig.helpMessages.usage,
        mergedConfig.helpMessages.commands,
        mergedConfig.helpMessages.options,
        mergedConfig.helpMessages.others
      ),
      mergedConfig.cli as unknown as (typeof config)['cli']
    )

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
    const pkg = await readJsonFile(path.join(cli.flags.cwd, './package.json'))

    if (cli.flags.externalAll) {
      const allDependencies = [
        ...Object.keys(pkg.dependencies ?? {}),
        ...Object.keys(pkg.devDependencies ?? {}),
        ...Object.keys(pkg.peerDependencies ?? {}),
      ]
      externals.push(...allDependencies)
    }

    // Path delimiter of file path may differ on different platform
    const pathDelimiter = config.platform === "win32" ? "\\" : "/"

    mergedConfig.generated = {
      pkg,
      projectName: cli.flags.cwd.split('/').slice(-2).join('/'),
      distPath: path.join(cli.flags.cwd, cli.flags.outdir),
      tmpDistPath: path.join(
        os.tmpdir(),
        `sirutils/${cli.flags.cwd.split(pathDelimiter).slice(-2).join(pathDelimiter)}/${Date.now()}`
      ),
      entryPaths: cli.flags.entrypoints.reduce((acc, curr) => {
        const glob = new Glob(curr)

        acc.push(...glob.scanSync(cli.flags.cwd))

        return acc
      }, [] as string[]),
      externals,
    }

    const pluginNames = [
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
    ].filter(dependency => dependency.startsWith('@sirutils/builder-plugin-'))

    if (pluginNames.length > 0) {
      ;(await Promise.all(pluginNames.map(pluginName => import(pluginName)))).map(plugin => {
        Object.assign(mergedConfig, plugin.plugin(mergedConfig, utils))
      })
    }

    await fs.mkdir(mergedConfig.generated.distPath, {
      recursive: true,
    })

    await fs.mkdir(mergedConfig.generated.tmpDistPath, {
      recursive: true,
    })

    const resultCli = meow(
      createHelpMessage(
        mergedConfig.helpMessages.usage,
        mergedConfig.helpMessages.commands,
        mergedConfig.helpMessages.options,
        mergedConfig.helpMessages.others
      ),
      mergedConfig.cli
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    ) as any

    if (resultCli.input.includes('build')) {
      await build(resultCli, mergedConfig)
    } else {
      for await (const input of resultCli.input) {
        if (Object.hasOwn(mergedConfig.actions, input)) {
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          await mergedConfig.actions[input]!(resultCli, mergedConfig)
        }
      }
    }

    if (resultCli.input.length === 0 || resultCli.flags.help) {
      resultCli.showHelp()

      return
    }

    await $`rm -rf ${mergedConfig.generated.tmpDistPath}`
  }
}
