import { mysql } from '../drivers'
import { userMigrations } from './users'

await mysql.api.down(userMigrations)
await mysql.api.up(userMigrations)
