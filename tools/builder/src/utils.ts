import { join } from 'path'
import type { BunPlugin } from 'bun'

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
  cwd: string = process.cwd(),
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  external = [] as any[],
  buildDts = true
) => {
  const entryPoints = paths.map(p => join(cwd, p))
  const outDir = join(cwd, './dist')
  const plugins: BunPlugin[] = []

  if (buildDts) {
    plugins.push(
      dts({
        output: {
          inlineDeclareGlobals: true,
          noBanner: true,
        },
        compilationOptions: {
          preferredConfigPath: join(cwd, 'tsconfig.json'),
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
  console.log(`[@sirutils/builder] building: ${cwd.split('/').slice(-2).join('/')}`)
}
