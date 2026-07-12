import type { AxiosInstance } from 'axios'
import type { ApiResponse } from '@core/types/api'
import { getHttpClient } from '@core/api/http/client'

export abstract class BaseApiService {
  protected readonly client: AxiosInstance

  constructor(client?: AxiosInstance) {
    this.client = client ?? getHttpClient()
  }

  protected async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const { data } = await this.client.get<ApiResponse<T>>(url, { params })
    return data.data
  }

  protected async post<T>(url: string, body?: unknown): Promise<T> {
    const { data } = await this.client.post<ApiResponse<T>>(url, body)
    return data.data
  }

  protected async put<T>(url: string, body?: unknown): Promise<T> {
    const { data } = await this.client.put<ApiResponse<T>>(url, body)
    return data.data
  }

  protected async patch<T>(url: string, body?: unknown): Promise<T> {
    const { data } = await this.client.patch<ApiResponse<T>>(url, body)
    return data.data
  }

  protected async delete<T>(url: string): Promise<T> {
    const { data } = await this.client.delete<ApiResponse<T>>(url)
    return data.data
  }
}
