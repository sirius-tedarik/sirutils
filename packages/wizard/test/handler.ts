import { ProjectError } from '@sirutils/core'

import { logger } from '../src/internal/logger'

process
  .on('unhandledRejection', (_reason, p) => {
    if (p instanceof ProjectError) {
      logger.error(p.stringify())
    } else {
      logger.error(p)
    }
  })
  .on('uncaughtException', err => {
    if (err instanceof ProjectError) {
      logger.error(err.stringify())
    } else {
      logger.error(err)
    }

    process.exit(1)
  })
