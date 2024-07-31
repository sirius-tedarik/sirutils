import { createLogger } from '@sirutils/core'

import { mysqlTags } from '../tag'

export const logger = createLogger(mysqlTags.logger)
