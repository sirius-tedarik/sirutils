import { tagBuilder } from './utils/tags'

// Core System Tags

const coreTag = tagBuilder('@sirutils/core')

export const coreTags = {
  env: coreTag('invalid-env'),
  lazy: coreTag('lazy-unexpected'),

  group: coreTag('group-missused'),
  groupAsync: coreTag('group-async-missused'),

  wrap: coreTag('wrap-missused'),
  wrapAsync: coreTag('wrap-async-missused'),

  forward: coreTag('forward'),

  createLogger: coreTag('create-logger'),
} as const

export type CoreTags = (typeof coreTags)[keyof typeof coreTags]

// Plugin System Tags

const pluginSystemTag = tagBuilder('@sirutils/core#plugin-system')

export const pluginSystemTags = {
  // context

  useContext: pluginSystemTag('use-context'),
  initContext: pluginSystemTag('init-context'),
  initContextHook: pluginSystemTag('init-context-hook'),

  contextUnexpected: pluginSystemTag('context-unexpected'),
  contextNotInitialized: pluginSystemTag('context-not-initialized'),

  // app
  createApp: pluginSystemTag('create-app'),
  appUnexpected: pluginSystemTag('app-unexpected'),

  // plugin

  pluginOptions: pluginSystemTag('plugin-options'),
  usePlugin: pluginSystemTag('use-plugin'),

  // plugin internals

  appUse: pluginSystemTag('app-use'),
} as const

export type PluginSystemTags = (typeof pluginSystemTags)[keyof typeof pluginSystemTags]
