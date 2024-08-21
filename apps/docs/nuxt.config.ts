export default defineNuxtConfig({
  devtools: { enabled: true },
  extends: ['shadcn-docs-nuxt'],
  compatibilityDate: '2024-07-06',
  devServer: {
    port: 10_000,
    host: '0.0.0.0',
  },
})
