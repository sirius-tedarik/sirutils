import './definitions'

import './internal/initialize'

export * from './utils/type-system'
export * from './utils/compiler'

export * from './tag'

export type { Static, TAnySchema } from '@sinclair/typebox'
export {
  TypeSystemPolicy,
  TypeSystem,
  TypeSystemDuplicateFormat,
  TypeSystemDuplicateTypeKind,
} from '@sinclair/typebox/system'
export { TypeCompiler, TypeCheck } from '@sinclair/typebox/compiler'
export { Value } from '@sinclair/typebox/value'
