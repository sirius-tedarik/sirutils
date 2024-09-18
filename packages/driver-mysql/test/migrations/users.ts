import { mysql } from '../drivers'

export const userMigrations = [
  mysql.api.migration(
    'users',
    '0.1.1',
    async () => {
      await mysql.api.execWith({ cache: false })`CREATE TABLE IF NOT EXISTS users (
      id varchar(255),
      name text,
      surname text,
      PRIMARY KEY (id)
    )`
    },
    async () => {
      await mysql.api.execWith({ cache: false })`DROP TABLE IF EXISTS users;`
    }
  ),
  mysql.api.migration(
    'users',
    '0.1.1',
    async () => {
      await mysql.api.execWith({ cache: false })`ALTER TABLE users ADD logins varint`
    },
    async () => {
      await mysql.api.execWith({ cache: false })`ALTER TABLE users DROP logins`
    }
  ),
]
