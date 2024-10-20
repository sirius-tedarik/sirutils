import './handler'
import './middlewares/auth'
import './services/users'
import './services/mails'
import { wizard } from './wizard'

const result = await wizard.api.call('users@0.1.1#signOut', {}, {})
