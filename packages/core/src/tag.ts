import { tagBuilder } from './utils/tags'

// Core System Tags

const coreTag = tagBuilder('@sirutils/core')

export const coreTags = {
  logger: coreTag('logger'),
  group: coreTag('group-missused'),
  wrap: coreTag('wrap-missused'),
  forward: coreTag('forward'),
  capsule: coreTag('capsule'),
  createActions: coreTag('create-actions'),

  // internal
  createLogger: coreTag('create-logger'),

  // errors
  env: coreTag('invalid-env'),
  lazy: coreTag('lazy-unexpected'),
}

export type CoreTags = (typeof coreTags)[keyof typeof coreTags]

// Plugin System Tags

const pluginSystemTag = tagBuilder('@sirutils/core#plugin-system')

export const pluginSystemTags = {
  // context
  initContext: pluginSystemTag('init-context'),
  contextUnexpected: pluginSystemTag('context-unexpected'),
  locked: pluginSystemTag('locked'),

  // plugin
  create: pluginSystemTag('create'),
  use: pluginSystemTag('use'),
  lookup: pluginSystemTag('lookup'),
  lookupByOption: pluginSystemTag('lookup-by-option'),
  get: pluginSystemTag('get'),
  pluginInitiator: pluginSystemTag('plugin-initiator'),

  // errors

  notFound: pluginSystemTag('not-found'),
}

export type PluginSystemTags = (typeof pluginSystemTags)[keyof typeof pluginSystemTags]
