// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', "@nuxtjs/tailwindcss"],
  css: ["@/assets/css/main.css"],
  supabase: {
    // redirect: false
    redirectOptions: {
      login: '/'
    }
  },
  ssr: false,
  trailingSlash: 'remove',
  router: {
    options: {
      strict: true
    }
  }
  // spaLoadingTemplate: './loading.html'
})