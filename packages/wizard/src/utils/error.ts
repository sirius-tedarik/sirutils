import { type BlobType, ProjectError, unwrap } from '@sirutils/core'
import { safeJsonParse } from '@sirutils/toolbox'
import { Errors, type GenericObject } from 'moleculer'

import { wizardTags } from '../tag'

export class WizardRegenerator extends Errors.Regenerator {
  restoreCustomError(plainError: Errors.PlainMoleculerError, payload: GenericObject): BlobType {
    if (typeof plainError === 'string') {
      const parsed = unwrap(safeJsonParse(plainError)) as unknown as Sirutils.ProjectErrorType

      return new ProjectError(
        parsed.name,
        parsed.name,
        parsed.cause,
        parsed.data,
        parsed.timestamp
      ).appendData(payload)
    }

    return ProjectError.create(wizardTags.unexpected, 'WizardRegenerator').appendData(
      plainError,
      payload
    )
  }

  extractPlainError(err: unknown): BlobType {
    if (err instanceof ProjectError) {
      return err.stringify()
    }
  }
}
