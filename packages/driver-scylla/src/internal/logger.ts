import { createLogger } from '@sirutils/core'

import { driverScyllaTags } from '../tag'
import { ENV } from './consts'

export const logger = createLogger(driverScyllaTags.logger, ENV.console === 'silent' ? -999 : 999)
