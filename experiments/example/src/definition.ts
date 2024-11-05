/// <reference types="@sirutils/std/results" />

import type { exampleTags } from './tag'

declare global {
  namespace Std {
    // ------------ Std - results ------------

    interface Error {
      examples: typeof exampleTags
    }
  }
}
