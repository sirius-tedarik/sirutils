import type { BlobType } from '@sirutils/core'

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean'
}
export const isString = (value: unknown): value is string => {
  return typeof value === 'string'
}
export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number'
}

export const set = (obj: BlobType, path: string | string[], value: unknown) => {
  const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g)

  if (!pathArray) {
    return
  }

  pathArray.reduce((acc, key, i) => {
    if (acc[key] === undefined) {
      acc[key] = {}
    }
    if (i === pathArray.length - 1) {
      acc[key] = value
    }
    return acc[key]
  }, obj)
}

export const omit = (obj: BlobType, props: string[]) => {
  // biome-ignore lint/style/noParameterAssign: Redundant
  obj = { ...obj }

  for (const prop of props) {
    Reflect.deleteProperty(obj, prop)
  }

  return obj
}

export const get = (obj: BlobType, path: string | string[], defValue?: unknown) => {
  const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g)

  if (!pathArray) {
    return
  }

  const result = pathArray.reduce((prevObj, key) => prevObj?.[key], obj)

  return result === undefined ? defValue : result
}

export const has = (obj: BlobType, path: string | string[]) => {
  const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g)

  if (!pathArray) {
    return
  }

  return !!pathArray.reduce((prevObj, key) => prevObj?.[key], obj)
}
