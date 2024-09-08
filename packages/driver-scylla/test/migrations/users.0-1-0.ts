import { scylla } from '../drivers'

scylla.api.migration(
  'users',
  '0.1.0',
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
)
