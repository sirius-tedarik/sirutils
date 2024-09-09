import { type BlobType, createLogger } from '@sirutils/core'
import { type LogLevels, Loggers } from 'moleculer'

import { wizardTags } from '../tag'

export const logger = createLogger(wizardTags.logger)

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
