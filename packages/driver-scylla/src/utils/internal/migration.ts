import { ProjectError, type Promisify, createActions, wrap } from '@sirutils/core'
import { ulid, unique } from '@sirutils/safe-toolbox'
import { semver } from 'bun'

import { logger } from '../../internal/logger'
import { driverScyllaTags } from '../../tag'

export const migrationActions = createActions(
  async (context: Sirutils.DriverScylla.Context): Promise<Sirutils.DriverScylla.MigrationApi> => {
    const redis = context.lookup('driver-redis')

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
        const name = names[0]

        if (!name) {
          return ProjectError.create(
            driverScyllaTags.invalidUpUsage,
            'provide at least one migration'
          ).throw()
        }

        if (names.length > 1) {
          return ProjectError.create(
            driverScyllaTags.invalidUpUsage,
            'only same tables in one run'
          ).throw()
        }

        const currentStatus = (
          await context.api.execWith<Sirutils.DBSchemas['settings']>()`
            SELECT ${context.api.columns()} FROM ${context.api.table('settings')}
            WHERE ${context.api.and([
              {
                type: 'migration',
                name,
              },
            ])} ${context.api.limit(1)}`
        )[0]

        const targetMigrations = migrations
          .filter(migration => {
            return (
              semver.order(currentStatus?.value || '0.0.0', migration[1]) === -1 &&
              (targetVersion ? semver.order(migration[1], targetVersion) < 1 : true)
            )
          })
          .toSorted((a, b) => semver.order(a[1], b[1]))

        if (targetMigrations.length === 0) {
          logger.debug(`table: ${name} is already migrated#up`)

          return
        }

        let lastSuccessVersion = '0.0.0'
        let lastError: null | ProjectError = null

        for (const targetMigration of targetMigrations) {
          const upgradeResult = await targetMigration[2]()

          if (upgradeResult.isOk()) {
            lastSuccessVersion = targetMigration[1]

            continue
          }

          const rollbackResult = await targetMigration[3]()

          logger.warn(
            `table: ${name} upgrade failed to version: ${targetMigration[1]} and rollback status: ${rollbackResult.isOk()}`
          )

          lastError = upgradeResult.error

          break
        }

        logger.warn(`clearing caches for table: ${name} cause: migration.up`)
        let list: string[] = []

        for await (const keys of redis.scan(`${context.api.$client.keyspace}#${name}#*`)) {
          list.push(...keys)

          if (list.length > 100) {
            await redis.del(...list)

            list = []
          }
        }

        if (list.length > 0) {
          await redis.del(...list)

          list = []
        }

        if (currentStatus) {
          await context.api.execWith()`${context.api.update('settings', {
            value: lastSuccessVersion,
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
            value: lastSuccessVersion,
          } satisfies Sirutils.DBSchemas['settings'])}`
        }

        if (lastError) {
          return lastError.throw()
        }

        logger.success(`table: ${name} migrated.up to version: ${lastSuccessVersion}`)
      },

      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
      down: async (migrations, targetVersion = '0.0.0') => {
        const names = unique(migrations.map(migration => migration[0]))
        const name = names[0]

        if (!name) {
          return ProjectError.create(
            driverScyllaTags.invalidDownUsage,
            'provide at least one migration'
          ).throw()
        }

        if (names.length > 1) {
          return ProjectError.create(
            driverScyllaTags.invalidDownUsage,
            'only same tables in one run'
          ).throw()
        }

        const currentStatus = (
          await context.api.execWith<Sirutils.DBSchemas['settings']>()`
            SELECT ${context.api.columns()} FROM ${context.api.table('settings')}
            WHERE ${context.api.and([
              {
                type: 'migration',
                name,
              },
            ])} ${context.api.limit(1)}`
        )[0]

        const sortedMigrations = migrations.toSorted((a, b) => semver.order(a[1], b[1])).reverse()

        const targetMigrations = migrations
          .filter(migration => {
            return (
              semver.order(currentStatus?.value ?? '0.0.0', migration[1]) >= 0 &&
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

        if (targetMigrations.length === 0 || !currentStatus) {
          logger.debug(`table: ${name} is already migrated#down`)

          return
        }

        let lastSuccessVersion: null | string = null
        let lastError: null | ProjectError = null

        for (const targetMigration of targetMigrations) {
          const downgradeResult = await targetMigration[3]()

          if (downgradeResult.isOk()) {
            lastSuccessVersion = targetMigration[1]

            continue
          }

          const rollbackResult = await targetMigration[2]()

          logger.warn(
            `table: ${name} downgrade failed to version: ${targetMigration[1]} and rollback status: ${rollbackResult.isOk()}`
          )

          lastError = downgradeResult.error

          break
        }

        logger.warn(`clearing caches for table: ${name} cause: migration.down`)
        let list: string[] = []

        for await (const keys of redis.scan(`${context.api.$client.keyspace}#${name}#*`)) {
          list.push(...keys)

          if (list.length > 100) {
            await redis.del(...list)

            list = []
          }
        }

        if (list.length > 0) {
          await redis.del(...list)

          list = []
        }

        const targetIndex = sortedMigrations.findIndex(
          migration => migration[1] === lastSuccessVersion
        )
        const targetValue =
          (lastError && !lastSuccessVersion && targetIndex === -1
            ? currentStatus.value
            : undefined) ??
          (lastError && !lastSuccessVersion ? sortedMigrations[targetIndex]?.at(1) : undefined) ??
          (lastError && lastSuccessVersion
            ? sortedMigrations[targetIndex + 1]?.at(1)
            : undefined) ??
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          (others.at(-1) ? others.at(-1)![1] : undefined) ??
          '0.0.0'

        await context.api.execWith()`${context.api.update('settings', {
          value: targetValue,
        })} WHERE ${context.api.and([
          {
            id: currentStatus.id,
            type: currentStatus.type,
            name: currentStatus.name,
          },
        ])}`

        if (lastError) {
          return lastError.throw()
        }

        logger.success(`table: ${name} migrated.down to version: ${targetValue}`)
      },
    }
  },
  driverScyllaTags.migration
)
