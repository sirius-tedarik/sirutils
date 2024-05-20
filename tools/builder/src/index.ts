import { watch } from 'fs'
import { join } from 'path'
import { Command } from 'commander'

import pkg from '../package.json'
import type { CommanderOptions } from './definitions'
import { build, dependencies } from './utils'

const program = new Command()

program.name(pkg.name).version(pkg.version)

program
  .command('build')
  .argument('<string...>', 'paths')
  .option('-w --watch', 'watch', false)
  .option('--cwd <string>', 'cwd', process.cwd())
  .option('-a --external-all', 'externals', false)
  .option('-s --schema', 'schema', false)
  .option('-sd --schema-dir', 'schema directory', join(process.cwd(), 'schemas'))
  .option('-e --external <packages...>', 'externals', [])
  .action(async (paths: string[], options: CommanderOptions) => {
    const externals = [
      ...(options.externalAll ? await dependencies(options.cwd) : []),
      ...(options.external || []),
    ]

    await build(paths, options, externals)

    if (options.watch) {
      watch(options.cwd, { recursive: true }, async (event, filename) => {
        if (typeof filename === 'string' && !filename.includes('dist')) {
          await build(paths, options, externals)
        }
      })
    }
  })

await program.parseAsync()
