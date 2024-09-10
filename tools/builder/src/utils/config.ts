import { helpMessages } from './help-message'
import os from 'node:os'

export const config = {
  platform: os.platform(),
  helpMessages,
  bundle: {
    entrypoints: ['src/**/*.ts'],
    minify: true,
    outdir: 'dist',
    target: 'bun',
    sourcemap: 'external',
    plugins: [],
  },
  cli: {
    importMeta: import.meta,
    allowUnknownFlags: true,
    autoHelp: true,
    flags: {
      entrypoints: {
        type: 'string' as const,
        shortFlag: 'e',
        default: ['src/**/*.ts'],
        isMultiple: true as const,
      },

      externals: {
        type: 'string' as const,
        shortFlag: 'x',
        default: [],
        isMultiple: true as const,
      },

      outdir: {
        type: 'string' as const,
        shortFlag: 'o',
        default: 'dist',
      },

      minify: {
        type: 'boolean' as const,
        shortFlag: 'm',
        default: true,
      },

      target: {
        type: 'string' as const,
        shortFlag: 't',
        choices: ['node', 'bun', 'browser'],
        default: 'bun',
      },

      sourcemap: {
        type: 'string' as const,
        shortFlag: 's',
        choices: ['external', 'inline', 'none'],
        default: 'external',
      },

      cwd: {
        type: 'string' as const,
        default: process.cwd(),
      },

      externalAll: {
        type: 'boolean' as const,
        shortFlag: 'a',
        default: true,
      },

      help: {
        type: 'boolean' as const,
        shortFlag: 'h',
      },
    },
  },

  actions: {},
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  generated: {} as any,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
} satisfies Sirutils.Builder.Options<any>
