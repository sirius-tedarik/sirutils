import { unwrap, wrap, wrapAsync } from '@sirutils/core'
import { schema2typebox } from 'schema2typebox'
import { type ModuleDeclaration, ModuleDeclarationKind, type Project } from 'ts-morph'

import { schemaTags } from '../../tag'
import { updateChecksum } from './checksum'

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
  },
  schemaTags.generateInterface
)

export const generateDefinitions = wrapAsync(
  async (project: Project, file: Sirutils.Schema.Normalized) => {
    const sourceFile =
      project.addSourceFileAtPathIfExists(file.targetPath) ??
      project.createSourceFile(file.targetPath, '', {
        overwrite: true,
      })

    unwrap(updateChecksum(sourceFile, file))

    sourceFile.getImportDeclarations().filter(importDeclaration => {
      importDeclaration.remove()
    })

    sourceFile.getTypeAliases().filter(aliasDeclaration => {
      if (aliasDeclaration.isExported()) {
        aliasDeclaration.remove()
      }
    })

    sourceFile.getVariableDeclarations().filter(variableDeclaration => {
      if (variableDeclaration.isExported()) {
        variableDeclaration.remove()
      }
    })

    const result = (
      await schema2typebox({
        input: JSON.stringify(file.validator),
      })
    ).replace('Static', 'type Static')

    sourceFile.addStatements(result.slice(result.indexOf('*/') + 2))

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
  },
  schemaTags.generateDefinition
)
