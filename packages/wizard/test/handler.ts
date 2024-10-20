import { ProjectError } from '@sirutils/core'

import { logger } from '../src/internal/logger'

process
  // biome-ignore lint/nursery/noSecrets: <explanation>
  .on('unhandledRejection', (_reason, p) => {
    if (p instanceof ProjectError) {
      p.appendCause('?handler')
      logger.error(p.stringify())
    } else {
      logger.error(p)
    }
  })
  // biome-ignore lint/nursery/noSecrets: <explanation>
  .on('uncaughtException', err => {
    if (err instanceof ProjectError) {
      err.appendCause('?handler')
      logger.error(err.stringify())
    } else {
      logger.error(err)
    }

    process.exit(1)
  })
