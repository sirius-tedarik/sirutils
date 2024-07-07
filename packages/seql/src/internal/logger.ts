import { createLogger } from '@sirutils/core'

import { ENV } from './consts'
import { seqlTags } from '../tag'

export const logger = createLogger(seqlTags.logger, ENV.console === 'silent' ? -999 : 999)
