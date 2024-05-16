import { watch } from 'fs'
import { Command } from 'commander'

import pkg from '../package.json'
import { build, dependencies } from './utils'

const program = new Command()

program.name(pkg.name).version(pkg.version)

program
  .command('build')
  .argument('<string...>', 'paths')
  .option('-w --watch', 'watch', false)
  .option('--cwd <string>', 'cwd', process.cwd())
  .option('-a --external-all', 'externals', false)
  .option('-e --external <numbers...>', 'externals', [])
  .action(async (paths: string[], options) => {
    const externals = [
      ...(options.externalAll ? await dependencies(options.cwd) : []),
      ...(options.external || []),
    ]

    await build(paths, options.cwd, externals)

    if (options.watch) {
      watch(options.cwd, { recursive: true }, async (event, filename) => {
        if (typeof filename === 'string' && !filename.includes('dist')) {
          await build(paths, options.cwd, externals)
        }
      })
    }
  })

await program.parseAsync()
