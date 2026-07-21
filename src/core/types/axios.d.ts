import 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuth?: boolean
    skipErrorToast?: boolean
    /** Override Accept-Language for this request (e.g. content fallback). */
    apiLocale?: string
    _retry?: boolean
  }

  export interface InternalAxiosRequestConfig {
    skipAuth?: boolean
    skipErrorToast?: boolean
    /** Override Accept-Language for this request (e.g. content fallback). */
    apiLocale?: string
    _retry?: boolean
  }
}

export {}
