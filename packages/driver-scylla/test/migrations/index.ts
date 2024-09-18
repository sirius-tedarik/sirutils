import { scylla } from '../drivers'
import { userMigrations } from './users'

await scylla.api.up(userMigrations)
