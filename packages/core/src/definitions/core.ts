import type { Result } from 'neverthrow'

import type { ProjectError } from '../result/error'
import type { ProjectMessage } from '../result/message'
import type { CoreTags } from '../tag'

declare global {
  // biome-ignore lint/style/noNamespace: Redundant
  namespace Sirutils {
    type ProjectErrorType = ProjectError
    type ProjectMessageType = ProjectMessage

    // ------------ Errors ------------

    // biome-ignore lint/suspicious/noEmptyInterface: for future overriding
    interface CustomErrors {}

    // use this instead of CustomErrors. CustomErrors is for overriding
    interface Error extends Sirutils.CustomErrors {
      core: CoreTags
    }

    // ------------ Messages ------------

    // biome-ignore lint/suspicious/noEmptyInterface: for future overriding
    interface CustomMessages {}

    // use this instead of CustomMessages. CustomMessages is for overriding
    interface Message extends CustomMessages {}

    type MessageResult = Result<Sirutils.ProjectMessageType, Sirutils.ProjectErrorType>
  }
}
