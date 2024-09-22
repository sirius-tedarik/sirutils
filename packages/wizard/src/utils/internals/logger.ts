import type { BlobType, Fn } from '@sirutils/core'
import { type LogLevels,  Loggers } from 'moleculer'

import { logger } from '../../internal/logger'
import { wizardTags } from '../../tag'

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

export const createServiceLogger = (name: string) => {
  const serviceLogger = logger.create({
    defaults: {
      tag: `${wizardTags.service}.${name}`
    }
  })

  //Get all level from logger instance
  const logLevels = Object.keys(serviceLogger.options.types) as LogLevels[]

  //Get logger functions of all levels from the logger instance and create an object with them
  return Object.fromEntries(logLevels.map((level) => {
  	return [level, serviceLogger[level] as Fn<BlobType, void>]
  }))
}
