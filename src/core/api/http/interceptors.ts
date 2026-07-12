import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { navigateTo } from '#app'
import { tokenStorage } from '@core/auth/token-storage'
import { normalizeApiError } from '@core/api/http/errors'
import { AUTH_ENDPOINT_FLAGS } from '@modules/auth/constants/endpoints'
import { useAuthStore } from '@modules/auth/stores/auth.store'
import { ROUTES } from '@shared/constants/routes'

type QueuedRequest = {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: QueuedRequest[] = []

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
      return
    }
    if (token) resolve(token)
  })
  failedQueue = []
}

async function forceLogout(): Promise<void> {
  const authStore = useAuthStore()
  authStore.clearSession()
  if (import.meta.client) {
    const localePath = useLocalePath()
    await navigateTo(localePath(ROUTES.AUTH.LOGIN))
  }
}

async function attemptTokenRefresh(client: AxiosInstance, originalRequest: InternalAxiosRequestConfig) {
  if (!AUTH_ENDPOINT_FLAGS.REFRESH_ENABLED) {
    await forceLogout()
    return Promise.reject(normalizeApiError(new Error('Refresh token flow is not enabled')))
  }

  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken || tokenStorage.isRefreshTokenExpired()) {
    await forceLogout()
    return Promise.reject(normalizeApiError(new Error('Refresh token is missing or expired')))
  }

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({
        resolve: (token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(client(originalRequest))
        },
        reject,
      })
    })
  }

  originalRequest._retry = true
  isRefreshing = true

  try {
    const authStore = useAuthStore()
    await authStore.refreshSession()
    const newToken = tokenStorage.getAccessToken()
    if (!newToken) {
      throw new Error('Access token missing after refresh')
    }

    processQueue(null, newToken)
    originalRequest.headers.Authorization = `Bearer ${newToken}`
    return client(originalRequest)
  } catch (refreshError) {
    processQueue(refreshError, null)
    await forceLogout()
    return Promise.reject(normalizeApiError(refreshError))
  } finally {
    isRefreshing = false
  }
}

export function setupRequestInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (!config.skipAuth) {
      const token = tokenStorage.getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  })
}

export function setupResponseInterceptor(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig | undefined
      if (!originalRequest) return Promise.reject(normalizeApiError(error))

      const status = error.response?.status

      if (status === 401 && !originalRequest.skipAuth && !originalRequest._retry) {
        // TODO: Enable automatic refresh when AUTH_ENDPOINT_FLAGS.REFRESH_ENABLED is true.
        if (AUTH_ENDPOINT_FLAGS.REFRESH_ENABLED) {
          return attemptTokenRefresh(client, originalRequest)
        }

        await forceLogout()
      }

      return Promise.reject(normalizeApiError(error))
    },
  )
}
