import { VueQueryPlugin, QueryClient, type VueQueryPluginOptions } from '@tanstack/vue-query'
import { normalizeApiError } from '@core/api/http/errors'

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: (failureCount, error) => {
          const apiError = normalizeApiError(error)
          if (apiError.statusCode >= 400 && apiError.statusCode < 500) return false
          return failureCount < 3
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  })

  const options: VueQueryPluginOptions = { queryClient }
  nuxtApp.vueApp.use(VueQueryPlugin, options)

  return {
    provide: {
      queryClient,
    },
  }
})
