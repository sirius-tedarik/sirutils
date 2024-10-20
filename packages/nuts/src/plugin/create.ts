import { createPlugin } from '@sirutils/core'
import { nutsTags } from '../tag'

export const createNuts = createPlugin(
  {
    name: 'nuts',
    version: '0.2.3',
  },
  () => ({}),
  nutsTags.plugin
)
