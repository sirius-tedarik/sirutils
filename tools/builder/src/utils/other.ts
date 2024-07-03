// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as meow from 'meow'
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as ora from 'ora'

export const utils: Sirutils.Builder.Utils = {
  meow,
  ora,
}

export const readJsonFile = async (filePath: string) => {
  const file = Bun.file(filePath)

  if (!(await file.exists())) {
    throw new Error(`${filePath} not found`)
  }

  return await file.json()
}
