import './definitions'

import { buildAll, query } from './seql'

// biome-ignore lint/style/noNamespaceImport: For re-export as Seql
import * as builder from './utils/builder'
// biome-ignore lint/style/noNamespaceImport: For re-export as Seql
import * as common from './utils/common'
// biome-ignore lint/style/noNamespaceImport: For re-export as Seql
import * as operations from './utils/operations'

export * from './tag'

export const Seql = {
  query,
  buildAll,

  ...builder,
  ...common,
  ...operations,
}
