export type ApiResponse<T> = {
  data: T
  message?: string
  success: boolean
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
}

export type PaginationMeta = {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  from: number | null
  to: number | null
}

export type ApiErrorResponse = {
  message: string
  code?: string
  errors?: Record<string, string[]>
  statusCode: number
}

export type RequestConfig = {
  skipAuth?: boolean
  skipErrorToast?: boolean
  _retry?: boolean
}
