// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxt/image',
    'floating-vue/nuxt',
    '@samk-dev/nuxt-vcalendar'
  ],
  // buildModules: [
  //   '@nuxtjs/moment'
  // ],
  // moment: {
  //   defaultLocale: 'es', // Configura el idioma por defecto (opcional)
  //   locales: ['es'],     // Agrega idiomas adicionales si es necesario
  //   timezone: true,      // Si necesitas manejar zonas horarias
  //   defaultTimezone: 'America/Lima' // Configura tu zona horaria (opcional)
  // },
  css: ['~/assets/css/main.css','~/assets/css/page.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  // piniaPluginPersistedstate: {
  //   storage: 'localStorage'
  // },
  // build: {
  //   transpile: ['pinia-plugin-persistedstate']
  // },
  piniaPluginPersistedstate: {
    storage: 'localStorage',
  },
})
