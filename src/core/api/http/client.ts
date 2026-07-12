import axios, { type AxiosInstance } from 'axios'
import type { RuntimeConfig } from 'nuxt/schema'

let httpClient: AxiosInstance | null = null

export function createHttpClient(config: RuntimeConfig): AxiosInstance {
  if (httpClient) return httpClient

  httpClient = axios.create({
    baseURL: config.public.apiBaseUrl as string,
    timeout: 30_000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  return httpClient
}

export function getHttpClient(): AxiosInstance {
  if (!httpClient) {
    throw new Error('HTTP client not initialized. Ensure axios plugin is loaded.')
  }
  return httpClient
}

export function resetHttpClient(): void {
  httpClient = null
}
