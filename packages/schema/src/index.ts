import './definitions'

import './internal/initialize'

export * from './utils/type-system'

export * from './tag'

export {
  TypeSystemPolicy,
  TypeSystem,
  TypeSystemDuplicateFormat,
  TypeSystemDuplicateTypeKind,
} from '@sinclair/typebox/system'
export { TypeCompiler, TypeCheck } from '@sinclair/typebox/compiler'
