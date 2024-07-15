export const hash = (data: string) => {
  return Bun.hash(data).toString(36)
}

export const hashError = (error: Sirutils.ProjectErrorType) => {
  const causes = [error.name, ...error.cause]
  const code = hash(causes.join(','))

  return {
    code,
    timestamp: error.timestamp,
  }
}
