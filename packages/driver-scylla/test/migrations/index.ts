import { scylla } from '../drivers'
import { userMigrations } from './users'

await scylla.api.up(userMigrations)
await scylla.api.down(userMigrations, '0.1.0')
