import type { Target } from 'bun'
import { definePlugin } from 'clerc'

import type { Cli } from '../../cli'
import { readJsonFile } from '../../utils/readJsonFile'
import { build } from './utils/build'
import { buildDts } from './utils/dts'

export interface Entries {
  source: string
  default: string
  types?: string
}

export const builderPlugin = definePlugin({
  // TODO: add help options
  setup: (cli: Cli) =>
    cli
      .command('build', 'build command', {
        flags: {
          target: {
            alias: 't',
            type: String,
            description: 'target environment [node, bun, browser]',
            default: 'bun',
          },

          noMinify: {
            alias: 'n',
            description: 'dont minify output',
            type: Boolean,
          },

          sourcemap: {
            alias: 's',
            description: 'add sourcemaps to output [external, inline, none]',
            default: 'external',
            type: String,
          },

          externals: {
            alias: 'e',
            default: undefined,
            description: 'mark libraries as external',
            type: [String],
          },

          externalAll: {
            alias: 'a',
            default: false,
            description: 'exclude all dependencies from build',
            type: Boolean,
          },
        },
      })
      .on('build', async context => {
        const pkgFile = await Bun.resolve('./package.json', context.flags.cwd)
        const pkg = await readJsonFile(pkgFile)

        if (!('exports' in pkg)) {
          throw new Error(`exports field should be declared in package.json ${pkgFile}`)
        }

        const externals = [
          ...(context.flags.externalAll
            ? [
                ...Object.keys(pkg.dependencies ?? {}),
                ...Object.keys(pkg.devDependencies ?? {}),
                ...Object.keys(pkg.peerDependencies ?? {}),
              ]
            : []),
          ...(context.flags.externals ? context.flags.externals : []),
        ]

        const entries = Object.values(pkg.exports) as Entries[]

        await Promise.all([
          ...entries.map(entry =>
            build({
              cwd: context.flags.cwd,
              // biome-ignore lint/style/noNonNullAssertion: Redundant
              target: context.flags.target! as Target,
              minify:
                // biome-ignore lint/style/noNonNullAssertion: <explanation>
                typeof context.flags.noMinify === 'undefined' ? true : !context.flags.noMinify!,

              externals,
              input: entry.source,
              output: entry.default,
            })
          ),
          buildDts({
            entries,
            cwd: context.flags.cwd,
          }),
        ])
      }),
})
