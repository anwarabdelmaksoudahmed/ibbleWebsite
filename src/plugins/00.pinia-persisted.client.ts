import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

/** Must load before auth-session so the auth store is created with persistence attached. */
export default defineNuxtPlugin({
  name: 'pinia-persisted',
  setup() {
    const pinia = usePinia()
    pinia.use(piniaPluginPersistedstate)
  },
})
