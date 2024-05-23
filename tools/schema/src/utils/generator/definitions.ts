import { unwrap, wrap } from '@sirutils/core'
import { type ModuleDeclaration, ModuleDeclarationKind, type Project } from 'ts-morph'

import { schemaTags } from '../../tag'
import { updateChecksum } from './checksum'
import { generateFields } from './fields'

export const generateInterface = wrap(
  (generated: ModuleDeclaration, file: Sirutils.Schema.Normalized) => {
    const tables =
      generated.getInterface('Tables') ??
      generated.addInterface({
        name: 'Tables',
      })

    const interfaceName = `${file.name.at(0)?.toUpperCase()}${file.name.slice(1)}`
    const tablesProperty =
      tables.getProperty(file.name) ??
      tables.addProperty({
        name: file.name,
      })

    if (tablesProperty.getType().getText() !== interfaceName) {
      tablesProperty.setType(interfaceName)
    }

    const table =
      generated.getInterface(interfaceName) ??
      generated.addInterface({
        name: interfaceName,
      })

    unwrap(generateFields(table, file))
  },
  schemaTags.generateInterface
)

export const generateDefinitions = wrap((project: Project, file: Sirutils.Schema.Normalized) => {
  const sourceFile =
    project.addSourceFileAtPathIfExists(file.targetPath) ??
    project.createSourceFile(file.targetPath, '', {
      overwrite: true,
    })

  unwrap(updateChecksum(sourceFile, file))

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

  unwrap(generateInterface(generated, file))

  sourceFile.fixMissingImports()
  sourceFile.fixUnusedIdentifiers()
}, schemaTags.generateDefinition)
