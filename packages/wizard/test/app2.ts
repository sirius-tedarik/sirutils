import './handler'
import './wizard'
import './services/test'

import type { BlobType } from '@sirutils/core'

import { logger } from '../src/internal/logger'
import { wizard } from './wizard'

const result = await wizard.api.call('users@0.1.1#create', [
  {
    name: 5 as BlobType,
  },
])

logger.log(result)
