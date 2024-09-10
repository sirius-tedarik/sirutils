import type { BlobType } from '@sirutils/core'
import { type LogLevels, Loggers } from 'moleculer'

import { logger } from '../internal/logger'
import { wizardTags } from '../tag'

export class WizardLogger extends Loggers.Base {
  getLogHandler(bindings: BlobType) {
    const found = logger.create({
      defaults: {
        tag: `${wizardTags.logger}.${[bindings.nodeId, bindings.mod].filter(value => !!value).join('.')}`,
      },
    })

    // @ts-expect-error
    return (type: LogLevels, args: BlobType[]) => found[type](...args)
  }
}
