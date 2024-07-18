import './definitions'

export * from './utils/fetch'
export * from './utils/other'

export * from './tag'

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'

dayjs.extend(duration)
dayjs.extend(customParseFormat)
dayjs.extend(utc)

export { dayjs, customParseFormat, duration, utc }
