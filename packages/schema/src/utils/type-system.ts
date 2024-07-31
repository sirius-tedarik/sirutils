import { FormatRegistry, Type } from '@sinclair/typebox'
import { TypeSystem } from '@sinclair/typebox/system'

import { BooleanString } from '../internal/boolean-string'
import { DateType } from '../internal/date'
import { File, Files } from '../internal/file'
import { formats } from '../internal/formats'
import { Numeric } from '../internal/numeric'
import { ObjectString } from '../internal/object-string'
import { MaybeEmpty, Nullable } from '../internal/other'

const t = Object.assign({}, Type)

for (const formatEntry of Object.entries(formats)) {
  const [formatName, formatValue] = formatEntry

  if (!FormatRegistry.Has(formatName)) {
    if (formatValue instanceof RegExp) {
      TypeSystem.Format(formatName, value => formatValue.test(value))
    } else if (typeof formatValue === 'function') {
      TypeSystem.Format(formatName, formatValue)
    }
  }
}

t.Numeric = Numeric(t)
t.Date = DateType(t)
t.BooleanString = BooleanString(t)
t.ObjectString = ObjectString(t)
t.Nullable = schema => Nullable(t)(schema)
t.MaybeEmpty = MaybeEmpty(t)

t.File = (arg = {}) =>
  File({
    default: 'File',
    ...arg,
    extension: arg?.type,
    type: 'string',
    format: 'binary',
  })

t.Files = (arg = {}) =>
  Files(t)({
    ...arg,
    sirutilsMeta: 'Files',
    default: 'Files',
    extension: arg?.type,
    type: 'array',
    items: {
      ...arg,
      default: 'Files',
      type: 'string',
      format: 'binary',
    },
  })

export { t }
