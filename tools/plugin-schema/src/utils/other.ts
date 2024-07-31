import type { JSONSchema7 } from 'json-schema'

export const addOptionalModifier = (
  code: string,
  propertyName: string,
  requiredProperties: JSONSchema7['required']
) => {
  return requiredProperties?.includes(propertyName) ? code : `t.Optional(${code})`
}
