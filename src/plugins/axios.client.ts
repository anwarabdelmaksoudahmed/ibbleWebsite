import { createHttpClient } from '@core/api/http/client'
import { setupRequestInterceptor, setupResponseInterceptor } from '@core/api/http/interceptors'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const client = createHttpClient(config)
  setupRequestInterceptor(client)
  setupResponseInterceptor(client)

  return {
    provide: {
      http: client,
    },
  }
})
