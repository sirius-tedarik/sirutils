import { type BlobType, ProjectError } from '@sirutils/core'
import { Errors, type GenericObject } from 'moleculer'

import { wizardTags } from '../../tag'

export class WizardRegenerator extends Errors.Regenerator {
  restoreCustomError(plainError: Errors.PlainMoleculerError, payload: GenericObject): BlobType {
    return new ProjectError(
      plainError.name as Sirutils.ErrorValues,
      plainError.message,
      plainError.cause as Sirutils.ErrorValues[],
      plainError.data,
      plainError.timestamp
    ).appendData(payload)
  }

  extractPlainError(err: unknown): BlobType {
    if (err instanceof ProjectError) {
      return { ...err }
    }

    return {
      ...ProjectError.create(wizardTags.unexpected, 'WizardRegenerator').appendData(err),
    }
  }
}
