import { logger } from '../src/internal/logger'
import './handler'
import './services/users'
import './wizard'
import { wizard } from './wizard'

logger.log(await wizard.api.call('users@0.1.1#foo', []))
