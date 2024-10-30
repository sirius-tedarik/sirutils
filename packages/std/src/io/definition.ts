/// <reference path="../shared/index.ts" />

import type { ioTags } from './tag'

declare global {
  namespace Std {
    // ------------ Errors ------------
    interface CustomErrors {
      'std/io': typeof ioTags
    }
  }
}
