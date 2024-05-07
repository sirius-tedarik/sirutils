export const ENV = {
  moonbaseSecret: Bun.env.MOONBASE_SECRET_KEY,
}

for (const [key, value] of Object.entries(ENV)) {
  if (!value) {
    throw new Error(`ENV.${key} is not found`)
  }
}
