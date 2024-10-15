import { scylla } from '../drivers'
import { userMigrations } from './users'

await scylla.api.down(userMigrations)
await scylla.api.up(userMigrations, '0.1.3')
