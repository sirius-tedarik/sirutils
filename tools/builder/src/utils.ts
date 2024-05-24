import { join } from 'path'
import type { BunPlugin } from 'bun'

import type { CommanderOptions } from './definitions'
import { dts } from './plugins'

export const dependencies = async (cwd = process.cwd()): Promise<string[]> => {
  const pkg = await Bun.file(join(cwd, './package.json')).json()

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
  const entryPoints = paths.map(p => join(options.cwd, p))
  const outDir = join(options.cwd, './dist')
  const plugins: BunPlugin[] = []

  if (options.schema) {
    try {
      // @ts-ignore ignore for cyclic dependencies (builder -><- schema)
      const schemaGeneratorPlugin = await import('@sirutils/schema')

      plugins.push(
        schemaGeneratorPlugin.schemaGeneratorPlugin({
          dir: options.schemaDir,
          force: options.force,
        })
      )
    } catch (err) {
      // biome-ignore lint/nursery/noConsole: <explanation>
      console.warn(`[@sirutils/builder] cannot build schemas: ${err}`)
    }
  }

  if (options.dts) {
    plugins.push(
      dts({
        output: {
          noBanner: true,
          inlineDeclareGlobals: true,
          exportReferencedTypes: false,
        },
        compilationOptions: {
          preferredConfigPath: join(options.cwd, 'tsconfig.json'),
          followSymlinks: false,
        },
      })
    )
  }

  await Bun.build({
    entrypoints: entryPoints,
    outdir: outDir,
    target: 'bun',
    plugins,
    external,
  })

  // biome-ignore lint/nursery/noConsole: <explanation>
  console.log(`[@sirutils/builder] building: ${options.cwd.split('/').slice(-2).join('/')}`)
}
