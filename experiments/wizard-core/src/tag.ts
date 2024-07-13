import { tagBuilder } from '@sirutils/core'

const createTag = tagBuilder('@sirutils/experiment-wizard-core')

export const experimentCoreTags = {
  app: createTag('app'),

  users: createTag('service-users'),
} as const

export type ExperimentCoreTags = (typeof experimentCoreTags)[keyof typeof experimentCoreTags]
