import { createLogger } from '@sirutils/core'

import { driverMysqlTags } from '../tag'
import { ENV } from './consts'

export const logger = createLogger(driverMysqlTags.logger, ENV.console === 'silent' ? -999 : 999)
