import { unwrap } from '../result/error'
import { createLogger } from '../utils/logger'

export const logger = unwrap(createLogger('@sirutils/core'))
