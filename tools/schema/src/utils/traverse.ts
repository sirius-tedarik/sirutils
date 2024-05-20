import path from 'node:path'
import { ResultAsync, unwrap, wrapAsync } from '@sirutils/core/dist'

import { schemaTags } from '../tag'
import { readdir, readJsonFile } from '../internal/fs'
import { fetchJson, isURL } from '../internal/common'

export const traverse = wrapAsync(async (dirPath: string) => {
  const filePaths = unwrap(await readdir(dirPath)).map(filePath => path.join(dirPath, filePath))
  const files = unwrap(await ResultAsync.combine(filePaths.map(filePath => readJsonFile(filePath))))

  for (const file of files) {
    if (file.importMaps) {
      for (const [name, extendedPath] of Object.entries(file.importMaps)) {
        const valid = isURL(extendedPath as string)

        if (valid.isOk()) {
          const json = unwrap(await fetchJson(extendedPath as string))

          if (json) {
            file.importMaps[name] = json
          }

          continue
        }

        const relativeExtendedPath = path.join(dirPath, extendedPath as string)
        const foundIndex = filePaths.indexOf(relativeExtendedPath)

        if (foundIndex === -1) {
          file.importMaps[name] = unwrap(await readJsonFile(relativeExtendedPath))
        } else {
          file.importMaps[name] = files[foundIndex]
        }
      }
    }
  }

  return files
}, schemaTags.traverse)
