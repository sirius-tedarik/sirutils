import './definitions'

export * from './tag'

import { query } from './seql'

// biome-ignore lint/style/noNamespaceImport: For re-export as Seql
import * as builder from './utils/builder'
// biome-ignore lint/style/noNamespaceImport: For re-export as Seql
import * as generater from './utils/generater'
// biome-ignore lint/style/noNamespaceImport: For re-export as Seql
import * as operations from './utils/operations'

export const Seql = {
  query,

  ...builder,
  ...generater,
  ...operations,
}
