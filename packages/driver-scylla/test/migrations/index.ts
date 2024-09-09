import './users-0-1-0'
import './users-0-1-1'

import { scylla } from '../drivers'

await scylla.api.up()
await scylla.api.down('0.1.0')
