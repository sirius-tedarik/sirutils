export interface CommanderOptions {
  cwd: string
  watch: boolean
  externalAll: boolean
  external: string[]
  dts: boolean

  force: boolean
  schema: boolean
  schemaDir: string
}
