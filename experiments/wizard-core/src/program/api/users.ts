import { ProjectError } from '@sirutils/core'
import { customTypeCompiler, t } from '@sirutils/schema'
import { Seql } from '@sirutils/seql'

import { type Users, users } from '../../../schemas/_/users'
import { db } from '../db'
import { wizard } from '../plugins/wizard'

export const usersService = wizard.service<Users>('users', '0.0.0', users.check)

usersService
  .find(
    async (_ctx, req) => {
      if (!req.params?.id) {
        return ProjectError.create('@sirutils/core#plugin-system.app-lookup', 'sa').throw()
      }

      const { data } = await db.exec<Users[]>(
        Seql.query`SELECT * from NewTable where ${Seql.and({ id: req.params.id })}`,
        {
          cache: false,
          parallel: true,
          safe: false,
        }
      )

      return data
    },
    {
      after: true,
    }
  )
  .create(
    () => {
      return []
    },
    {
      before: customTypeCompiler(
        t.Object({
          example: t.String(),
        })
      ),
    }
  )
  .delete(() => true)
  .update(() => [])
  .patch(() => [])
