import { type LogLevel, consola } from 'consola'

import { capsule } from '../result/error'
import { coreTags } from '../tag'

export const createLogger = capsule(
  (tag: string, level: LogLevel = Number.MAX_SAFE_INTEGER) =>
    consola.create({
      formatOptions: {
        date: true,
        compact: false,
        colors: true,
      },

      defaults: {
        tag,
      },

      level,
    }),
  coreTags.createLogger
)
