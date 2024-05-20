import { join } from 'node:path'
import { ResultAsync, unwrap, wrapAsync } from '@sirutils/core/dist'

import { fetchJson, isURL } from '../internal/common'
import { getFileChecksum, readJsonFile, readdir } from '../internal/fs'
import { schemaTags } from '../tag'

export const traverse = wrapAsync(async (dirPath: string) => {
  const filePaths = unwrap(await readdir(dirPath)).map(filePath => join(dirPath, filePath))
  const files = unwrap(await ResultAsync.combine(filePaths.map(filePath => readJsonFile(filePath))))

  for (const file of files) {
    const index = files.indexOf(file)

    file.path = filePaths[index]
    file.checksum = unwrap(await getFileChecksum(file.path))
    file.exists = await Bun.file(join(dirPath, 'dist/generated', file.checksum)).exists()

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

        const relativeExtendedPath = join(dirPath, extendedPath as string)
        const foundIndex = filePaths.indexOf(relativeExtendedPath)

        if (foundIndex === -1) {
          file.importMaps[name] = unwrap(await readJsonFile(relativeExtendedPath))
        } else {
          file.importMaps[name] = files[foundIndex]
        }
      }

      continue
    }

    file.importMaps = {}
  }

  return files as Sirutils.Schema.Normalized[]
}, schemaTags.traverse)
