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
  initContext: pluginSystemTag('init-context'),
  contextUnexpected: pluginSystemTag('context-unexpected'),

  // app
  appUse: pluginSystemTag('app-use'),

  // plugin
  pluginNotInitialized: pluginSystemTag('plugin-not-initialized'),

  // action
  createAction: pluginSystemTag('create-action'),
} as const

export type PluginSystemTags = (typeof pluginSystemTags)[keyof typeof pluginSystemTags]
