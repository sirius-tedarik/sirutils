import { consola, type LogLevel } from 'consola'

import { forward } from '../result/error'

export const createLogger = (tag: string, level: LogLevel = Number.MAX_SAFE_INTEGER) => {
  return forward(
    () =>
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
    tag as Sirutils.ErrorValues
  )
}
