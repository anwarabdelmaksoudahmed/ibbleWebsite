import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import type { NuxtPage } from 'nuxt/schema'
import tailwindcss from '@tailwindcss/vite'
import { extendModulePages } from './config/pages'

const srcDir = resolve(fileURLToPath(new URL('.', import.meta.url)), 'src')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: {
    compatibilityVersion: 4,
  },
  srcDir: 'src',

  dir: {
    middleware: 'core/middleware',
  },

  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxtjs/i18n',
    'nuxt-security',
    '@nuxtjs/seo',
    '@nuxt/test-utils/module',
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['lodash-es', 'dayjs', 'axios', 'zod'],
    },
  },

  alias: {
    '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
    '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    '@modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
  },

  imports: {
    dirs: [
      'shared/composables',
      'shared/utils',
      'core/helpers',
      'modules/**/composables',
    ],
  },

  components: [
    { path: '~/shared/components', pathPrefix: false },
    { path: '~/modules', pathPrefix: false, ignore: ['**/pages/**', '**/stores/**', '**/services/**', '**/api/**'] },
  ],

  runtimeConfig: {
    public: {
      appName: 'Ibble',
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
      authBaseUrl: process.env.NUXT_PUBLIC_AUTH_BASE_URL || 'https://auth-ibbil-dev.dafagate.com',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
  },

  app: {
    head: {
      title: 'Ibble',
      htmlAttrs: { lang: 'ar', dir: 'rtl' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'منصة إبل — خدمات الإبل في المملكة العربية السعودية' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/images/brand/ibbil-mark.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'ibble-color-mode',
  },

  i18n: {
    locales: [
      { code: 'ar', language: 'ar-SA', file: 'ar.json', name: 'العربية', dir: 'rtl' },
      { code: 'en', language: 'en-US', file: 'en.json', name: 'English', dir: 'ltr' },
    ],
    defaultLocale: 'ar',
    strategy: 'prefix_except_default',
    langDir: '../i18n/locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'ibble-locale',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'ar',
    },
  },

  fonts: {
    families: [
      { name: 'Tajawal', provider: 'google', weights: [400, 500, 700, 800] },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
    ],
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'https:', 'data:'],
      },
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
      referrerPolicy: 'strict-origin-when-cross-origin',
      xFrameOptions: 'SAMEORIGIN',
      xContentTypeOptions: 'nosniff',
    },
    rateLimiter: false,
  },

  site: {
    url: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
    name: 'Ibble',
    description: 'Enterprise SaaS Platform',
    defaultLocale: 'ar',
  },

  typescript: {
    strict: true,
    typeCheck: true,
    shim: false,
  },

  nitro: {
    compressPublicAssets: true,
  },

  experimental: {
    payloadExtraction: true,
    viewTransition: true,
  },

  routeRules: {
    '/auth/**': { ssr: false },
  },

  hooks: {
    'pages:extend'(pages: NuxtPage[]) {
      extendModulePages(pages, srcDir)
    },
  },
})
