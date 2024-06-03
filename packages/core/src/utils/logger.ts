import { type LogLevel, consola } from 'consola'
import { Result } from 'neverthrow'

import { ProjectError } from '../result/error'
import { coreTags } from '../tag'

export const createLogger = Result.fromThrowable(
  (tag: string, level: LogLevel = Number.MAX_SAFE_INTEGER) => {
    return consola.create({
      formatOptions: {
        date: true,
        compact: false,
        colors: true,
      },

      defaults: {
        tag,
      },

      level,
    })
  },
  e => ProjectError.create(coreTags.createLogger, `${e}`)
)
