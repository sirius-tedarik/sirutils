import { createLogger } from '@sirutils/core'
import { cronTags } from '../tag'

export const logger = createLogger(cronTags.logger)
