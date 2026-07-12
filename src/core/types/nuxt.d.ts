import type { Permission } from '@core/auth/types'

declare module '#app' {
  interface PageMeta {
    permission?: Permission | Permission[]
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    permission?: Permission | Permission[]
  }
}

export {}
