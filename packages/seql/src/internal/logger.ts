import { createLogger, unwrap } from '@sirutils/core'

import { ENV } from './consts'

export const logger = unwrap(createLogger('@sirutils/seql', ENV.console === 'silent' ? -999 : 999))
