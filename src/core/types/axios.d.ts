import 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuth?: boolean
    skipErrorToast?: boolean
    _retry?: boolean
  }

  export interface InternalAxiosRequestConfig {
    skipAuth?: boolean
    skipErrorToast?: boolean
    _retry?: boolean
  }
}

export {}
