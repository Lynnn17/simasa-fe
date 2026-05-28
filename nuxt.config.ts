const { API_HOST: rawApiHost, TOKEN_KEY, DOMAIN, PORT, TOKEN_MAX_AGE } = process.env
const API_HOST = rawApiHost?.replace(/\/+$/, '');
// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { appConfig } from "./config/app";
import { i18nConfig } from "./config/i18n";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // Auto imports & components configuration
  imports: {
    dirs: ['composables', 'utils', 'services', 'stores'],
  },
  components: true,

  // Modules
  modules: ["@pinia/nuxt", "@vee-validate/nuxt", "@nuxtjs/i18n"],

  // i18n configuration
  i18n: i18nConfig,

  // Disable sourcemaps for production build to save memory and avoid warnings
  sourcemap: {
    server: false,
    client: false
  },

  // CSS
  css: ["~/assets/css/main.css", "@vuepic/vue-datepicker/dist/main.css"],

  // Vite plugins
  vite: {
    plugins: [tailwindcss()],
  },

  // Runtime config for API
  runtimeConfig: {
    // Private keys (server-side only)
    apiSecret: "",

    // Public keys (exposed to client)
    public: {
      // Frontend calls /api/* which gets proxied to /v1/*
      apiBase: "/api",
      sseUrl: process.env.NUXT_PUBLIC_SSE_URL || "http://localhost:8098",
      tokenKey: TOKEN_KEY || "access_token",
      tokenMaxAge: Number(TOKEN_MAX_AGE) || 604800, // 7 days in seconds
    },
  },

  // Nitro server configuration with API proxy
  nitro: {
    // Development proxy - rewrites /api to /v1
    devProxy: {
      "/api": {
        target: `${API_HOST}/v1`,
        changeOrigin: true,
      },
    },

    // Production route rules - rewrites /api to /v1
    routeRules: {
      // /api/users → http://localhost:8080/v1/users
      "/api/**": {
        proxy: `${API_HOST}/v1/**`,
      },
    },
  },

  // Route rules for caching
  routeRules: {
    // Static pages - prerender
    "/login": { prerender: true },
  },

  // App configuration
  app: appConfig,

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: false,
  },
});
