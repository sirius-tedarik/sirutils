import './definitions'

export * from './utils/fetch'
export * from './utils/url'
export * from './utils/object-like'
export * from './utils/types'
export * from './utils/merge'
export * from './utils/proxy'
export * from './utils/json'
export * from './utils/ejson'

export * from './tag'

export * from 'evt'
export * from 'ulidx'

// biome-ignore lint/nursery/noExportedImports: Redundant
import dayjs from 'dayjs'
// biome-ignore lint/nursery/noExportedImports: Redundant
import customParseFormat from 'dayjs/plugin/customParseFormat'
// biome-ignore lint/nursery/noExportedImports: Redundant
import duration from 'dayjs/plugin/duration'
// biome-ignore lint/nursery/noExportedImports: Redundant
import utc from 'dayjs/plugin/utc'
// biome-ignore lint/nursery/noExportedImports: Redundant
import deepmerge from 'deepmerge'
// biome-ignore lint/nursery/noExportedImports: Redundant
import ejson from 'ejson'
// biome-ignore lint/nursery/noExportedImports: Redundant
import traverse from 'traverse'

dayjs.extend(duration)
dayjs.extend(customParseFormat)
dayjs.extend(utc)

export { dayjs, customParseFormat, duration, utc, deepmerge, traverse, ejson }
