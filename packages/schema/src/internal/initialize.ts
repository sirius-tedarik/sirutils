import { FormatRegistry } from '@sinclair/typebox'
import { TypeSystem } from '@sinclair/typebox/system'
import { dayjs, isURL } from '@sirutils/safe-toolbox'

if (!FormatRegistry.Has('date')) {
  TypeSystem.Format('date', (value: string | number) => {
    return dayjs(value).isValid()
  })
}

if (!FormatRegistry.Has('time')) {
  TypeSystem.Format('time', (value: string | number) => dayjs(value, 'HH:mm:ss', true).isValid())
}

if (!FormatRegistry.Has('date-time')) {
  TypeSystem.Format('date-time', (value: string | number) =>
    dayjs(value, 'YYYY-MM-DDTHH:mm:ss', true).isValid()
  )
}

if (!FormatRegistry.Has('iso-time')) {
  TypeSystem.Format('iso-time', (value: string | number) =>
    dayjs(value, 'HH:mm:ss.sssZ', true).isValid()
  )
}

if (!FormatRegistry.Has('iso-date-time')) {
  TypeSystem.Format(
    'iso-date-time',
    (value: string) =>
      typeof value === 'string' && dayjs(value, 'YYYY-MM-DDTHH:mm:ss.sssZ', true).isValid()
  )
}
if (!FormatRegistry.Has('timestamp')) {
  TypeSystem.Format('timestamp', (value: string | number) => dayjs(value, 'x').isValid())
}

if (!FormatRegistry.Has('duration')) {
  TypeSystem.Format('duration', (value: string) => dayjs.duration(value).toISOString() === value)
}

if (!FormatRegistry.Has('url')) {
  TypeSystem.Format('url', (value: string) => isURL(value).isOk())
}

if (!FormatRegistry.Has('numeric')) {
  FormatRegistry.Set('numeric', value => !!value && !Number.isNaN(+value))
}

if (!FormatRegistry.Has('boolean')) {
  FormatRegistry.Set('boolean', value => value === 'true' || value === 'false')
}

if (!FormatRegistry.Has('ObjectString')) {
  FormatRegistry.Set('ObjectString', value => {
    let start = value.charCodeAt(0)

    if (start === 9 || start === 10 || start === 32) {
      start = value.trimStart().charCodeAt(0)
    }

    if (start !== 123 && start !== 91) {
      return false
    }

    try {
      JSON.parse(value)

      return true
    } catch {
      return false
    }
  })
}

if (!FormatRegistry.Has('numeric')) {
  FormatRegistry.Set('numeric', value => !!value && !Number.isNaN(+value))
}

if (!FormatRegistry.Has('boolean')) {
  FormatRegistry.Set('boolean', value => value === 'true' || value === 'false')
}

if (!FormatRegistry.Has('ObjectString')) {
  FormatRegistry.Set('ObjectString', value => {
    let start = value.charCodeAt(0)

    if (start === 9 || start === 10 || start === 32) {
      start = value.trimStart().charCodeAt(0)
    }

    if (start !== 123 && start !== 91) {
      return false
    }

    try {
      JSON.parse(value)

      return true
    } catch {
      return false
    }
  })
}
