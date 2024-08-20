import type { Result, ResultAsync } from 'neverthrow'

import type { ProjectError } from '../result/error'
import type { ProjectMessage } from '../result/message'
import type { Option } from '../result/option'
import type { CoreTags } from '../tag'
import type { BlobType } from '../utils/common'
import type { LiteralUnion } from 'type-fest'

declare global {
  /**
   * Sirutils namespace is used to merge types in all projects.
   */
  namespace Sirutils {
    type ProjectErrorType = ProjectError
    type ProjectMessageType = ProjectMessage

    interface Env {}

    // ------------ Errors ------------

    /**
     * The interface where we combine tags in each project
     */
    interface CustomErrors {}

    /**
     * Use this instead of CustomErrors. CustomErrors is for overriding
     */
    interface Error extends Sirutils.CustomErrors {
      core: CoreTags
    }

    /**
     * Shortcut for union intersection of Sirtuils.Error values
     */
    type ErrorValues = LiteralUnion<Sirutils.Error[keyof Sirutils.Error], `?${string}`>

    /**
     * Shortcut for extraction value of Option
     */
    type ExtractOption<T> = T extends Option<BlobType> ? ReturnType<T['unwrap']> : never

    /**
     * Shortcut for creating Results based on Sirutils.ProjectErrorType
     */
    type ProjectResult<T> = Result<T, Sirutils.ProjectErrorType>

    /**
     * Shortcut for creating AsyncResults based on Sirutils.ProjectErrorType
     */
    type ProjectAsyncResult<T> = ResultAsync<T, Sirutils.ProjectErrorType>

    // ------------ Messages ------------

    /**
     * The interface where we combine messages in each project
     */
    interface CustomMessages {}

    /**
     * Use this instead of CustomMessages. CustomMessages is for overriding
     */
    interface Message extends CustomMessages {}

    /**
     * Predefined result type for messages
     */
    type MessageResult = Result<Sirutils.ProjectMessageType, Sirutils.ProjectErrorType>
  }
}
