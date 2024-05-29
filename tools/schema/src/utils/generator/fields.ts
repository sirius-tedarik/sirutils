import { wrap } from '@sirutils/core'
import type { InterfaceDeclaration } from 'ts-morph'

import { schemaTags } from '../../tag'

export const generateFields = wrap(
  (table: InterfaceDeclaration, file: Sirutils.Schema.Normalized) => {
    const currentProperties = table.getProperties()

    for (const field of file.fields) {
      const found =
        currentProperties.find(currentProperty => currentProperty.getName() === field.name) ??
        table.addProperty({
          name: field.name,
        })

      if (found.getType().getText() !== field.targetType) {
        found.setType(field.targetType)
      }

      found.setHasQuestionToken(!field.required)
    }

    for (const property of currentProperties) {
      if (!property.wasForgotten()) {
        if (!file.fields.some(field => field.name === property.getName())) {
          property.remove()
        }
      }
    }
  },
  schemaTags.generateFields
)
