import { ProjectError, Result } from '@sirutils/core'
import { safeToolboxTags } from '../tag'

import EJSON from "ejson";

export const safeEjsonParse = Result.fromThrowable(EJSON.parse, e =>
  ProjectError.create(safeToolboxTags.safeEjsonParse, `${e}`)
)

export const safeEjsonStringify = Result.fromThrowable(EJSON.stringify, e =>
  ProjectError.create(safeToolboxTags.safeEjsonStringify, `${e}`)
)
