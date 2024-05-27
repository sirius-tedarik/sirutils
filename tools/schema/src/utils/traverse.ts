import { join } from 'node:path'
import { unwrap, wrapAsync } from '@sirutils/core'
import { readdir, readJsonFile } from '@sirutils/toolbox'

import { schemaTags } from '../tag'
import { normalize } from './normalize'

export const traverse = wrapAsync(async (dir: string) => {
  const absoluteDir = join(process.cwd(), dir)

  const filePaths = unwrap(await readdir(absoluteDir)).filter(filePath => !filePath.includes('_'))
  const fileResults = await Promise.all(
    filePaths.map(filePath => readJsonFile<Sirutils.Schema.Original>(join(absoluteDir, filePath)))
  )

  const results: Sirutils.Schema.Normalized[] = []

  for (let index = 0; index < fileResults.length; index++) {
    // biome-ignore lint/style/noNonNullAssertion: Redundant
    const fileResult = fileResults[index]!

    if (fileResult.isErr()) {
      continue
    }

    // biome-ignore lint/style/noNonNullAssertion: Redundant
    results.push(unwrap(await normalize(fileResult.value, filePaths[index]!, dir)))
  }

  return results
}, schemaTags.traverse)
