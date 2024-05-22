import { wrap } from '@sirutils/core'
import type { InterfaceDeclaration } from 'ts-morph'

import { schemaTags } from '../../tag'

export const generateFields = wrap(
  (table: InterfaceDeclaration, file: Sirutils.Schema.Normalized) => {
    const currentProperties = table.getProperties()

    for (const field of file.fields) {
      const finded =
        currentProperties.find(currentProperty => currentProperty.getName() === field.name) ??
        table.addProperty({
          name: field.name,
          type: 'any',
        })

      // TODO: Field types
    }
  },
  schemaTags.generateFields
)
