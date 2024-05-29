import { unwrap, wrap, wrapAsync } from '@sirutils/core'
import _ from 'lodash'
import { schema2typebox } from 'schema2typebox'
import {
  type ModuleDeclaration,
  ModuleDeclarationKind,
  type Project,
  VariableDeclarationKind,
} from 'ts-morph'

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

    // remove all imports
    sourceFile.getImportDeclarations().filter(importDeclaration => {
      importDeclaration.remove()
    })

    // remove exported types
    sourceFile.getTypeAliases().filter(aliasDeclaration => {
      if (aliasDeclaration.isExported()) {
        aliasDeclaration.remove()
      }
    })

    // remove exported const's
    sourceFile.getVariableDeclarations().filter(variableDeclaration => {
      variableDeclaration.remove()
    })

    sourceFile.addImportDeclaration({
      moduleSpecifier: '@sirutils/core',
      namedImports: ['ProjectError', 'unwrap', 'wrap'],
    })
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@sinclair/typebox/compiler',
      namedImports: ['TypeCompiler'],
    })
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@sirutils/schema',
      namedImports: ['schemaTags'],
    })

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

    const result = (
      await schema2typebox({
        input: JSON.stringify(file.validator),
      })
    )
      .replace('Static', 'type Static')
      .replaceAll(file.name, `$${file.name}`)

    sourceFile.addStatements(result.slice(result.indexOf('*/') + 2))

    sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const, // defaults to "let"
      declarations: [
        {
          name: 'compiled',
          initializer: `TypeCompiler.Compile($${file.name})`,
        },
      ],
    })

    sourceFile
      .addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: file.name,
            initializer: writer => {
              writer
                .write(`wrap((data: ${_.upperFirst(file.name)}) =>`)
                .block(() => {
                  writer.writeLine('const result = compiled.Check(data)')

                  writer.write('if (!result)').block(() => {
                    writer.writeLine(
                      `unwrap(ProjectError.create(schemaTags.invalidData, 'invalid data').appendData([...compiled.Errors(data)]).asResult())`
                    )
                  })

                  writer.writeLine('return true as const')
                })
                .write(', schemaTags.invalidData)')
            },
          },
        ],
      })
      .setIsExported(true)

    unwrap(updateChecksum(sourceFile, file))

    sourceFile.formatText()
    sourceFile.fixMissingImports()
    sourceFile.fixUnusedIdentifiers()
  },
  schemaTags.generateDefinition
)
