import { unlink } from 'node:fs/promises'
import { join } from 'node:path'

import type { BuildConfig } from 'bun'

export interface BuildOptions {
  cwd: string
  input: string
  output: string
  minify: boolean
  sourcemap: 'external' | 'inline' | 'none'

  externals: string[]
  target: BuildConfig['target']
}

export const build = async (options: BuildOptions) => {
  try {
    const inputPath = await Bun.resolve(options.input, options.cwd)
    const outputPath = join(options.cwd, options.output)

    const bundleFile = async () => {
      const builder = await Bun.build({
        entrypoints: [inputPath],

        // biome-ignore lint/style/noNonNullAssertion: Redundant
        target: options.target!,
        external: options.externals,
        minify: options.minify
          ? {
              identifiers: false,
              syntax: true,
              whitespace: true,
            }
          : false,
        root: options.cwd,
        sourcemap: options.sourcemap,
      })

      if (!builder.success) {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.error(...builder.logs)
      }

      if (await Bun.file(outputPath).exists()) {
        await unlink(outputPath)
      }

      const jsFile = builder.outputs.find(output => output.path.endsWith('.js'))
      const mapFile = builder.outputs.find(output => output.path.endsWith('.js.map'))

      await Promise.all([
        // biome-ignore lint/style/noNonNullAssertion: Redundant
        Bun.write(outputPath, await jsFile!.arrayBuffer(), {
          createPath: true,
        }),
        mapFile
          ? Bun.write(`${outputPath}.map`, await mapFile.arrayBuffer(), {
              createPath: true,
            })
          : Promise.resolve(),
      ])
    }

    await bundleFile()

    return true
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error(err)
    process.exit(1)
  }
}
