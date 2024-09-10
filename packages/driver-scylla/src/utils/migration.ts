import { ProjectError, type Promisify, createActions, unwrap, wrap } from '@sirutils/core'
import { ulid, unique } from '@sirutils/safe-toolbox'
import { semver } from 'bun'

import { logger } from '../internal/logger'
import { driverScyllaTags } from '../tag'

export const migrationActions = createActions(
  async (context: Sirutils.DriverScylla.Context): Promise<Sirutils.DriverScylla.MigrationApi> => {
    await context.api.execWith()`CREATE TABLE IF NOT EXISTS ${context.api.table('settings')} (
      id text,
      type text,
      name text,
      value text,
      PRIMARY KEY ((type, name), id)
    )`

    return {
      migration: (
        name: string,
        version: string,
        rawUp: () => Promisify<unknown>,
        rawDown: () => Promisify<unknown>
      ) => {
        return [
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
        ]
      },

      up: async (migrations, targetVersion) => {
        const names = unique(migrations.map(migration => migration[0]))
        const loop = wrap(
          async (
            cb: () => Sirutils.ProjectAsyncResult<unknown>,
            retryCount = 0,
            error?: Sirutils.ProjectErrorType
          ): Promise<true> => {
            if (retryCount >= 2) {
              return ProjectError.create(
                `${driverScyllaTags.migration}#up.loop` as Sirutils.ErrorValues,
                'failed'
              )
                .appendData(error)
                .throw()
            }

            const result = await cb()

            if (result.isErr()) {
              return unwrap(await loop(cb, retryCount + 1, result.error))
            }

            return true
          },
          `${driverScyllaTags.migration}#up.loop` as Sirutils.ErrorValues
        )

        for (const name of names) {
          const currentStatus = (
            await context.api.execWith()<Sirutils.DBSchemas['settings']>`
              SELECT ${context.api.columns()} FROM ${context.api.table('settings')}
              WHERE ${context.api.and([
                {
                  type: 'migration',
                  name,
                },
              ])} LIMIT 1`
          )[0]

          const targets = migrations
            .filter(migration => {
              return (
                semver.order(currentStatus?.value || '0.0.0', migration[1]) === -1 &&
                migration[0] === name &&
                (targetVersion ? semver.order(migration[1], targetVersion) < 1 : true)
              )
            })
            .toSorted((a, b) => semver.order(a[1], b[1]))

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

          if (currentStatus) {
            await context.api.execWith()`${context.api.update('settings', {
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              value: targets.at(-1)![1],
            })} WHERE ${context.api.and([
              {
                id: currentStatus.id,
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

      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
      down: async (migrations, targetVersion) => {
        const names = unique(migrations.map(migration => migration[0]))

        const loop = wrap(
          async (
            cb: () => Sirutils.ProjectAsyncResult<unknown>,
            retryCount = 0,
            error?: Sirutils.ProjectErrorType
          ): Promise<true> => {
            if (retryCount >= 2) {
              return ProjectError.create(
                `${driverScyllaTags.migration}#down.loop` as Sirutils.ErrorValues,
                'failed'
              )
                .appendData(error)
                .throw()
            }

            const result = await cb()

            if (result.isErr()) {
              return unwrap(await loop(cb, retryCount + 1, result.error))
            }

            return true
          },
          `${driverScyllaTags.migration}#down.loop` as Sirutils.ErrorValues
        )

        for (const name of names) {
          const currentStatus = (
            await context.api.execWith()<Sirutils.DBSchemas['settings']>`
              SELECT ${context.api.columns()} FROM ${context.api.table('settings')}
              WHERE ${context.api.and([
                {
                  type: 'migration',
                  name,
                },
              ])} LIMIT 1`
          )[0]

          const targets = migrations
            .filter(migration => {
              return (
                semver.order(currentStatus?.value ?? '0.0.0', migration[1]) >= 0 &&
                migration[0] === name &&
                (targetVersion ? semver.order(migration[1], targetVersion) === 1 : true)
              )
            })
            .toSorted((a, b) => semver.order(a[1], b[1]))
            .reverse()

          const others = migrations
            .filter(migration => {
              return (
                migration[0] === name &&
                semver.order(targetVersion ?? '0.0.0', migration[1]) >= 0 &&
                semver.order(currentStatus?.value ?? '0.0.0', migration[1]) >= 0
              )
            })
            .toSorted((a, b) => semver.order(a[1], b[1]))

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

          if (currentStatus) {
            await context.api.execWith()`${context.api.update('settings', {
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              value: (others.at(-1) ? others.at(-1)![1] : undefined) ?? '0.0.0',
            })} WHERE ${context.api.and([
              {
                id: currentStatus.id,
                type: currentStatus.type,
                name: currentStatus.name,
              },
            ])}`
          } else {
            await context.api.execWith()`${context.api.insert('settings', {
              id: ulid(),
              type: 'migration',
              name,
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              value: (others.at(-1) ? others.at(-1)![1] : undefined) ?? '0.0.0',
            } satisfies Sirutils.DBSchemas['settings'])}`
          }
        }
      },
    }
  },
  driverScyllaTags.migration
)
