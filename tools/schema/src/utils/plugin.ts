import { join } from 'node:path'
import { unwrap } from '@sirutils/core'
import { Project } from 'ts-morph'

import type { BunPlugin } from 'bun'

import { generateDefinitions } from './generator/definitions'
import { traverse } from './traverse'

export interface SchemaGeneratorPluginConfig {
  dir: string
}

export const schemaGeneratorPlugin = (config: SchemaGeneratorPluginConfig): BunPlugin => {
  return {
    name: 'schema-generator-plugin',
    async setup(build) {
      const files = unwrap(await traverse(config.dir))

      if (files.length === 0) {
        return
      }

      const project = new Project({
        tsConfigFilePath: join(process.cwd(), 'tsconfig.json'),
        skipAddingFilesFromTsConfig: true,
      })

      project.addSourceFilesAtPaths(`${config.dir}/_/**/*{.d.ts,.ts}`)
      project.createDirectory('schemas/_')

      for (const file of files) {
        if (file.exists) {
          const sourceFile = project.getSourceFile(file.targetPath)
          const comments = sourceFile?.getStatementsWithComments()

          if (comments && comments.length > 0) {
            const checksum = comments.at(0)?.getText()

            if (checksum?.includes(file.checksum)) {
              // biome-ignore lint/nursery/noConsole: TODO: remove this
              console.log('>>> skipping', file.path)

              continue
            }
          }
        }

        unwrap(generateDefinitions(project, file))
      }

      await project.save()
    },
  }
}
