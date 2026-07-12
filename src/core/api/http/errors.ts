import type { ApiErrorResponse } from '@core/types/api'

export class ApiError extends Error {
  statusCode: number
  code?: string
  errors?: Record<string, string[]>

  constructor(response: ApiErrorResponse) {
    super(response.message)
    this.name = 'ApiError'
    this.statusCode = response.statusCode
    this.code = response.code
    this.errors = response.errors
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function normalizeApiError(error: unknown): ApiError {
  if (isApiError(error)) return error

  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: { status: number; data?: Partial<ApiErrorResponse> }
      message?: string
    }

    return new ApiError({
      message: axiosError.response?.data?.message ?? axiosError.message ?? 'An unexpected error occurred',
      code: axiosError.response?.data?.code,
      errors: axiosError.response?.data?.errors,
      statusCode: axiosError.response?.status ?? 500,
    })
  }

  return new ApiError({
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    statusCode: 500,
  })
}
