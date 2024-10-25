import type { LiteralUnion } from 'type-fest'

import type { ProjectError } from './utils/project-error'

declare global {
  /**
   * Std namespace is used to merge types in all projects.
   */
  namespace Std {
    type ProjectErrorType = ProjectError

    // ------------ Errors ------------

    /**
     * The interface where we combine tags in each project
     */
    interface CustomErrors {}

    /**
     * Use this instead of CustomErrors. CustomErrors is for overriding
     */
    interface Error extends Std.CustomErrors {}

    /**
     * Shortcut for union intersection of Sirtuils.Error values
     */
    type ErrorValues = LiteralUnion<Std.Error[keyof Std.Error], `?${string}`>
  }
}
