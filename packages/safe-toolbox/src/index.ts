import './definitions'

export * from './utils/fetch'
export * from './utils/other'

export * from './tag'

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)
dayjs.extend(customParseFormat)

export { dayjs, customParseFormat, duration }
