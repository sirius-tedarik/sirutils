import './definitions'

export * from './utils/fetch'
export * from './utils/url'
export * from './utils/object-like'
export * from './utils/types'
export * from './utils/merge'
export * from './utils/proxy'
export * from './utils/json'

export * from './tag'

export * from 'evt'

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import deepmerge from 'deepmerge'

dayjs.extend(duration)
dayjs.extend(customParseFormat)
dayjs.extend(utc)

export { dayjs, customParseFormat, duration, utc, deepmerge }
