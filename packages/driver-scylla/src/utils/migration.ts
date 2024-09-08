import { semver } from 'bun'
import {
  type BlobType,
  ProjectError,
  type Promisify,
  createActions,
  unwrap,
  wrap,
} from '@sirutils/core'
import { ulid, unique } from '@sirutils/safe-toolbox'

import { driverScyllaTags } from '../tag'
import { logger } from '../internal/logger'

export const migrationActions = createActions(
  async (context: Sirutils.DriverScylla.Context): Promise<Sirutils.DriverScylla.MigrationApi> => {
    await context.api.execWith()`CREATE TABLE IF NOT EXISTS ${context.api.table('settings')} (
      id text,
      type text,
      name text,
      value text,
      PRIMARY KEY (id, type, name)
    )`

    const migrations: [
      string,
      string,
      () => Sirutils.ProjectAsyncResult<unknown>,
      () => Sirutils.ProjectAsyncResult<unknown>,
    ][] = []

    return {
      migration: (
        name: string,
        version: string,
        rawUp: () => Promisify<unknown>,
        rawDown: () => Promisify<unknown>
      ) => {
        migrations.push([
          name,
          version,
          wrap(
            async () => await rawUp(),
            `${driverScyllaTags.migration}#${name}.${version}.up` as Sirutils.ErrorValues
          ),
          wrap(
            async () => await rawDown(),
            `${driverScyllaTags.migration}#${name}.${version}.down` as Sirutils.ErrorValues
          ),
        ])
      },

      up: async () => {
        semver.order({}, undefined as BlobType)

        const versions = await context.api.execWith()<Sirutils.DBSchemas['settings']>`
          SELECT ${context.api.columns()} FROM ${context.api.table('settings')}
          WHERE ${context.api.and([
            {
              type: 'migration',
            },
          ])}`

        const names = unique(migrations.map(migration => migration[0]))
        const loop = wrap(
          async (cb: () => Sirutils.ProjectAsyncResult<unknown>, retryCount = 0): Promise<true> => {
            if (retryCount >= 2) {
              return ProjectError.create(
                `${driverScyllaTags.migration}#up.loop` as Sirutils.ErrorValues,
                'failed'
              ).throw()
            }

            const result = await cb()

            if (result.isErr()) {
              return unwrap(await loop(cb, retryCount + 1))
            }

            return true
          },
          `${driverScyllaTags.migration}#up.loop` as Sirutils.ErrorValues
        )

        for (const name of names) {
          const currentVersion = versions.find(version => version.name === name)

          const targets = migrations
            .filter(migration => {
              return (
                semver.order(currentVersion?.value || '0.0.0', migration[1]) < 1 &&
                migration[0] === name
              )
            })
            .toSorted((a, b) => semver.order(a[2], b[2]))

          if (targets.length === 0) {
            continue
          }

          for (const migration of targets) {
            const result = await loop(migration[2])

            if (result.isErr()) {
              logger.error(result.error.stringify())

              await migration[3]()
            }
          }

          if (currentVersion) {
            await context.api.execWith()`${context.api.update('settings', {
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              value: targets.at(-1)![1],
            })} WHERE ${context.api.and([
              {
                id: currentVersion.id,
                type: currentVersion.type,
                name: currentVersion.name,
              },
            ])}`
          } else {
            await context.api.execWith()`${context.api.insert('settings', {
              id: ulid(),
              type: 'migration',
              name,
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              value: targets.at(-1)![1],
            } satisfies Sirutils.DBSchemas['settings'])}`
          }
        }
      },

      down: async () => {
        const versions = await context.api.execWith()<Sirutils.DBSchemas['settings']>`
          SELECT ${context.api.columns()} FROM ${context.api.table('settings')}
          WHERE ${context.api.and([
            {
              type: 'migration',
            },
          ])}`

        const names = unique(migrations.map(migration => migration[0]))

        const loop = wrap(
          async (cb: () => Sirutils.ProjectAsyncResult<unknown>, retryCount = 0): Promise<true> => {
            if (retryCount >= 2) {
              return ProjectError.create(
                `${driverScyllaTags.migration}#down.loop` as Sirutils.ErrorValues,
                'failed'
              ).throw()
            }

            const result = await cb()

            if (result.isErr()) {
              return unwrap(await loop(cb, retryCount + 1))
            }

            return true
          },
          `${driverScyllaTags.migration}#down.loop` as Sirutils.ErrorValues
        )

        for (const name of names) {
          const currentVersion = versions.find(version => version.name === name)

          const targets = migrations
            .filter(migration => {
              return (
                semver.order(currentVersion?.value ?? '0.0.0', migration[1]) > -1 &&
                migration[0] === name
              )
            })
            .toSorted((a, b) => semver.order(a[2], b[2]))

          if (targets.length === 0) {
            continue
          }

          for (const migration of targets) {
            const result = await loop(migration[3])

            if (result.isErr()) {
              logger.error(result.error.stringify())

              await migration[3]()
            }
          }

          if (currentVersion) {
            await context.api.execWith()`${context.api.update('settings', {
              value: '0.0.0',
            })} WHERE ${context.api.and([
              {
                id: currentVersion.id,
                type: currentVersion.type,
                name: currentVersion.name,
              },
            ])}`
          } else {
            await context.api.execWith()`${context.api.insert('settings', {
              id: ulid(),
              type: 'migration',
              name,
              value: '0.0.0',
            } satisfies Sirutils.DBSchemas['settings'])}`
          }
        }
      },
    }
  },
  driverScyllaTags.migration
)
