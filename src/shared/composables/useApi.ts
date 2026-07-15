import { getHttpClient } from '@core/api/http/client'
import { getApiErrorMessage, normalizeApiError } from '@core/api/http/errors'
import type { ApiError } from '@core/api/http/errors'

export function useApi() {
  const client = getHttpClient()
  const toast = useToast()

  function handleError(error: unknown, showToast = true): ApiError {
    const apiError = normalizeApiError(error)
    if (showToast && import.meta.client) {
      toast.error(getApiErrorMessage(apiError))
    }
    return apiError
  }

  return {
    client,
    handleError,
  }
}
