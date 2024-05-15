import type { BlobType } from '@sirutils/core'

import { buildAll } from './utils/builder'
import { generate } from './utils/generater'

/**
 * Use this for creating queries
 */
export const query = (texts: TemplateStringsArray, ...values: BlobType[]) => {
  return generate(buildAll(texts, ...values))
}
