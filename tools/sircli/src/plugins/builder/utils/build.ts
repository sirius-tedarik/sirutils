import { unlink } from 'node:fs/promises'
import { join } from 'node:path'

import type { BuildConfig } from 'bun'

export interface BuildOptions {
  cwd: string
  input: string
  output: string
  minify: boolean

  externals: string[]
  target: BuildConfig['target']
}

export const build = async (options: BuildOptions) => {
  const inputPath = await Bun.resolve(options.input, options.cwd)
  const outputPath = join(options.cwd, options.output)

  const bundleFile = async () => {
    const builder = await Bun.build({
      entrypoints: [inputPath],

      // biome-ignore lint/style/noNonNullAssertion: Redundant
      target: options.target!,
      external: options.externals,
      minify: options.minify,
      root: options.cwd,
    })

    if (await Bun.file(outputPath).exists()) {
      await unlink(outputPath)
    }

    // biome-ignore lint/style/noNonNullAssertion: Redundant
    await Bun.write(outputPath, await builder.outputs[0]!.arrayBuffer(), {
      createPath: true,
    })
  }

  await bundleFile()

  return true
}
