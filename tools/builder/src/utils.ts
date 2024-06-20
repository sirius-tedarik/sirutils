import path from 'node:path'
import type { BunPlugin } from 'bun'

import type { CommanderOptions } from './definitions'
import { dts } from './plugins'

export const dependencies = async (cwd = process.cwd()): Promise<string[]> => {
  const pkg = await Bun.file(path.join(cwd, './package.json')).json()

  const list = ['dependencies', 'peerDependencies', 'optionalDependencies', 'devDependencies']
  const result: string[] = []

  // biome-ignore lint/complexity/noForEach: <explanation>
  list.forEach(key => {
    result.push(...Object.keys(pkg[key] || []))
  })

  return result
}

export const build = async (
  paths: string[],
  options: CommanderOptions,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  external = [] as any[]
) => {
  const entryPoints = paths.map(p => path.join(options.cwd, p))
  const outDir = path.join(options.cwd, './dist')
  const plugins: BunPlugin[] = []

  if (options.dts) {
    plugins.push(
      dts({
        output: {
          noBanner: true,
          inlineDeclareGlobals: true,
          exportReferencedTypes: false,
        },
        compilationOptions: {
          preferredConfigPath: path.join(options.cwd, 'tsconfig.json'),
          followSymlinks: false,
        },
      })
    )
  }

  const result = await Bun.build({
    entrypoints: entryPoints,
    outdir: outDir,
    target: 'bun',
    plugins,
    external,
  })

  if (result.logs.length > 0) {
    // biome-ignore lint/nursery/noConsole: <explanation>
    console.error(result.logs)

    process.exit(1)
  }

  // biome-ignore lint/nursery/noConsole: <explanation>
  console.log(`[@sirutils/builder] building: ${options.cwd.split('/').slice(-2).join('/')}`)
}
