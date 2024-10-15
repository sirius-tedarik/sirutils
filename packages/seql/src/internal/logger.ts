import { createLogger } from '@sirutils/core'

import { seqlTags } from '../tag'
import { ENV } from './consts'

export const logger = createLogger(seqlTags.logger, ENV.console === 'silent' ? -999 : 999)
