import { ProjectError } from '@sirutils/core'
import { customTypeCompiler, t } from '@sirutils/schema'
import { wizard } from '../plugins/wizard'

import { type Users, users } from '../../../schemas/_/users'

export const usersService = wizard.service<Users>('users', '0.0.0', users.check)

usersService
  .find((_ctx, req) => {
    if (req.params?.id === '1') {
      ProjectError.create('@sirutils/core#plugin-system.app-lookup', 'sa').throw()
    }

    return []
  })
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
