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
      'shared/maps/composables',
      'shared/payment/composables',
      'shared/utils',
      'core/helpers',
      'modules/**/composables',
    ],
  },

  components: [
    { path: '~/shared/components', pathPrefix: false },
    { path: '~/shared/maps/components', pathPrefix: false },
    { path: '~/shared/payment/components', pathPrefix: false },
    {
      path: '~/modules',
      pathPrefix: false,
      ignore: [
        '**/pages/**',
        '**/stores/**/*.{ts,js}',
        '**/services/**',
        '**/api/**',
        '**/types/**',
        '**/constants/**',
        '**/utils/**',
        '**/composables/**',
      ],
    },
  ],

  runtimeConfig: {
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Ibble',
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL || 'https://marketplace-api-ibbil-dev.dafagate.com/api',
      authBaseUrl: process.env.NUXT_PUBLIC_AUTH_BASE_URL || 'https://auth.ibbil.com',
      webApiBaseUrl:
        process.env.NUXT_PUBLIC_WEB_API_BASE_URL || 'https://api-web.ibbil.com/api',
      insuranceApiBaseUrl:
        process.env.NUXT_PUBLIC_INSURANCE_API_BASE_URL || 'https://api-insurance.ibbil.com/',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
      whatsappNumber: process.env.NUXT_PUBLIC_WHATSAPP_NUMBER || '966500000000',
      hyperPayWidgetBaseUrl:
        process.env.NUXT_PUBLIC_HYPERPAY_WIDGET_BASE_URL
        || 'https://eu-test.oppwa.com/v1/paymentWidgets.js',
      googleMapsApiKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
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
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
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
        'script-src': [
          "'self'",
          "'unsafe-inline'",
          'https://eu-test.oppwa.com',
          'https://oppwa.com',
          'https://maps.googleapis.com',
          'https://maps.gstatic.com',
        ],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://maps.gstatic.com'],
        'frame-src': ["'self'", 'https://eu-test.oppwa.com', 'https://oppwa.com'],
        'connect-src': [
          "'self'",
          'https://eu-test.oppwa.com',
          'https://oppwa.com',
          'https://maps.googleapis.com',
          'https://places.googleapis.com',
          'https:',
        ],
        'form-action': ["'self'", 'https://eu-test.oppwa.com', 'https://oppwa.com'],
        // Allow HTTP LAN access in dev (`nuxt dev --host`); browsers otherwise
        // upgrade CSS/JS/images to HTTPS and they fail to load.
        'upgrade-insecure-requests': process.env.NODE_ENV === 'development' ? false : true,
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
    name: process.env.NUXT_PUBLIC_APP_NAME || 'Ibble',
    description: 'Enterprise SaaS Platform',
    defaultLocale: 'ar',
  },

  typescript: {
    strict: true,
    typeCheck: true,
    shim: false,
    tsConfig: {
      compilerOptions: {
        types: ['@types/google.maps'],
      },
    },
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
    '/payment/**': { ssr: false },
  },

  hooks: {
    'pages:extend'(pages: NuxtPage[]) {
      extendModulePages(pages, srcDir)
    },
  },
})
