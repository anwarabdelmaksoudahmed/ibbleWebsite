import type { ApiErrorResponse } from '@core/types/api'

export class ApiError extends Error {
  statusCode: number
  code?: string
  errors?: Record<string, string[]>

  constructor(response: ApiErrorResponse) {
    super(normalizeMessage(response.message))
    this.name = 'ApiError'
    this.statusCode = response.statusCode
    this.code = response.code
    this.errors = response.errors
  }
}

function normalizeMessage(message: unknown): string {
  if (Array.isArray(message)) {
    return message.map(String).filter(Boolean).join(' · ')
  }
  if (typeof message === 'string' && message.trim()) return message
  return 'An unexpected error occurred'
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function getApiFieldErrors(error: ApiError): Record<string, string[]> {
  return error.errors ?? {}
}

export function getApiFieldError(error: ApiError, field: string): string | undefined {
  return error.errors?.[field]?.find(Boolean)
}

export function getApiErrorMessage(error: ApiError): string {
  const fieldMessages = error.errors
    ? Object.values(error.errors).flat().filter(Boolean)
    : []

  if (fieldMessages.length > 0) {
    return fieldMessages.join(' · ')
  }

  return error.message
}

export function normalizeApiError(error: unknown): ApiError {
  if (isApiError(error)) return error

  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: {
        status: number
        data?: Partial<ApiErrorResponse> & { error?: string }
      }
      message?: string
    }

    const data = axiosError.response?.data
    const message = normalizeMessage(
      data?.message ?? data?.error ?? axiosError.message ?? 'An unexpected error occurred',
    )

    // Nest class-validator often returns `message: string[]` with no `errors` map.
    const errors =
      data?.errors ??
      (Array.isArray(data?.message)
        ? { validation: data.message.map(String) }
        : undefined)

    return new ApiError({
      message,
      code: data?.code,
      errors,
      statusCode: axiosError.response?.status ?? 500,
    })
  }

  return new ApiError({
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    statusCode: 500,
  })
}
