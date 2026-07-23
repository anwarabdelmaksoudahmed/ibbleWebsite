/** Website API paths under `webApiBaseUrl` (already includes `/api`). */
export const MEDIA_ENDPOINTS = {
  NEWS: '/v1/user/news',
  NEWS_BY_ID: (id: string) => `/v1/user/news/${id}`,
  EVENTS: '/v1/user/events',
  EVENTS_BY_ID: (id: string) => `/v1/user/events/${id}`,
  IMAGE_GALLERIES: '/v1/user/galleries/image',
  IMAGE_GALLERY_BY_ID: (id: string) => `/v1/user/galleries/image/${id}`,
  VIDEO_GALLERIES: '/v1/user/galleries/video',
  VIDEO_GALLERY_BY_ID: (id: string) => `/v1/user/galleries/video/${id}`,
} as const
