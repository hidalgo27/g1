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
  runtimeConfig: {
    apiSecret: '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "https://api.gotoecuador.com/api",
      // apiBaseTest: process.env.API_BASE_TEST || "https://app.gotolatam.travel/api",
      // apiBaseTest: '',
      // gtmContainerId: process.env.NUXT_PUBLIC_GTM_CONTAINER_ID || '',
      // apiBase: process.env.API_BASE_TEST || "http://localhost:8080/api",
    }
  },
})
