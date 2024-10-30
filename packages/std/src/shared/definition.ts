/// <reference path="../results/index.ts" />

import type { sharedTags } from './tag'

declare global {
  namespace Std {
    // ------------ Errors ------------
    interface CustomErrors {
      'std/shared': typeof sharedTags
    }
  }
}
