import { wrap } from '@sirutils/core'
import { type ModuleDeclaration, ModuleDeclarationKind, type Project } from 'ts-morph'

import { schemaTags } from '../../tag'

export const generateInterface = wrap(
  (generated: ModuleDeclaration, file: Sirutils.Schema.Normalized) => {
    const Tables =
      generated.getInterface('Tables') ??
      generated.addInterface({
        name: 'Tables',
      })

    const interfaceName = `${file.name.at(0)?.toUpperCase()}${file.name.slice(1)}`

    const Table =
      generated.getInterface(interfaceName) ??
      generated.addInterface({
        name: interfaceName,
      })
  },
  schemaTags.generateInterface
)

export const generateDefinitions = wrap((project: Project, file: Sirutils.Schema.Normalized) => {
  const sourceFile =
    project.addSourceFileAtPathIfExists(file.targetPath) ??
    project.createSourceFile(
      file.targetPath,
      writer => {
        writer.writeLine(`// ${file.checksum}`)
      },
      {
        overwrite: true,
      }
    )

  const global =
    sourceFile.getModule('global') ??
    sourceFile.addModule({
      name: 'global',
      declarationKind: ModuleDeclarationKind.Global,
      hasDeclareKeyword: true,
    })

  const sirutils =
    global.getModule('Sirutils') ??
    global.addModule({
      name: 'Sirutils',
      declarationKind: ModuleDeclarationKind.Namespace,
      hasDeclareKeyword: false,
    })

  const schemas =
    sirutils.getModule('Schema') ??
    sirutils.addModule({
      name: 'Schema',
      declarationKind: ModuleDeclarationKind.Namespace,
      hasDeclareKeyword: false,
    })

  const generated =
    schemas.getModule('Generated') ??
    schemas.addModule({
      name: 'Generated',
      declarationKind: ModuleDeclarationKind.Namespace,
      hasDeclareKeyword: false,
    })

  generateInterface(generated, file)
}, schemaTags.generateDefinition)
