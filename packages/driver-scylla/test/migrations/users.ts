import { scylla } from '../drivers'

export const userMigrations = [
  scylla.api.migration(
    'users',
    '0.1.1',
    async () => {
      await scylla.api.execWith({ cache: false })`CREATE TABLE IF NOT EXISTS users (
      id text,
      name text,
      surname text,
      roles set<text>,
      PRIMARY KEY (id, name, surname)
    )`
    },
    async () => {
      await scylla.api.execWith({ cache: false })`DROP TABLE IF EXISTS users;`
    }
  ),
  scylla.api.migration(
    'users',
    '0.1.1',
    async () => {
      await scylla.api.execWith({ cache: false })`ALTER TABLE users ADD logins varint`
    },
    async () => {
      await scylla.api.execWith({ cache: false })`ALTER TABLE users DROP logins`
    }
  ),
]
