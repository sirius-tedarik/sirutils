import { createLogger } from '@sirutils/core'

import { ENV } from './consts'

export const logger = createLogger('@sirutils/seql', ENV.console === 'silent' ? -999 : 999)
