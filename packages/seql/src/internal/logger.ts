import { ENV } from './consts'

// TODO: change to planned logger

export const logger = {
  warn: (...messages: unknown[]) => {
    if (ENV.console === 'silent') {
      return
    }

    // biome-ignore lint/nursery/noConsole: Redundant
    console.warn(...messages)
  },
}
