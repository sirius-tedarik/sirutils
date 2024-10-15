import { createLogger } from '@sirutils/core'

import { driverRedisTags } from '../tag'
import { ENV } from './consts'

export const logger = createLogger(driverRedisTags.logger, ENV.console === 'silent' ? -999 : 999)
