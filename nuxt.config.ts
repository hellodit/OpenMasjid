// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/ui'],

  devtools: { enabled: true },

  // The CMS + TV display are designed for a single (light/dark-specific) palette.
  ui: { colorMode: false },

  css: ['~/assets/css/main.css'],

  // Nuxt UI wraps @nuxt/fonts; declare families used outside of CSS vars.
  fonts: {
    families: [
      { name: 'Plus Jakarta Sans', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Lora', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Amiri', provider: 'google', weights: [400, 700] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500] },
    ],
  },

  // Secrets (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL) are read from
  // process.env directly so CLI scripts share the same config; see .env.example.

  compatibilityDate: '2025-07-15',

  typescript: {
    strict: true,
  },
})
