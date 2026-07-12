export type SwiperEffect = 'slide' | 'fade'

export type SwiperPaginationMode = boolean | 'bullets' | 'fraction' | 'progressbar'

export type SwiperControlsVariant = 'light' | 'dark' | 'brand'

export type SwiperControlsPosition = 'inside' | 'outside' | 'overlay-bottom'

export type SwiperAutoplayOptions = {
  delay?: number
  pauseOnMouseEnter?: boolean
  disableOnInteraction?: boolean
}

export type SwiperBreakpointOptions = {
  slidesPerView?: number | 'auto'
  spaceBetween?: number
  centeredSlides?: boolean
}

export type BaseSwiperProps = {
  /** Unique-ish key for each slide when using `items` */
  items?: unknown[]
  /** CSS height, e.g. 410 | '410px' | '100%' */
  height?: string | number
  /** Root class */
  class?: string
  /** Swiper viewport class */
  swiperClass?: string
  effect?: SwiperEffect
  loop?: boolean
  speed?: number
  initialSlide?: number
  autoplay?: boolean | SwiperAutoplayOptions
  slidesPerView?: number | 'auto'
  spaceBetween?: number
  centeredSlides?: boolean
  grabCursor?: boolean
  freeMode?: boolean
  watchOverflow?: boolean
  breakpoints?: Record<number, SwiperBreakpointOptions>
  navigation?: boolean
  pagination?: SwiperPaginationMode
  keyboard?: boolean
  mousewheel?: boolean
  /** Soft zoom on active slide images */
  kenBurns?: boolean
  controlsVariant?: SwiperControlsVariant
  controlsPosition?: SwiperControlsPosition
  /** Wrap in ClientOnly (recommended for SSR) */
  clientOnly?: boolean
  /** Accessible name for the carousel */
  label?: string
  prevLabel?: string
  nextLabel?: string
  /** Extra Swiper options (escape hatch) */
  options?: Record<string, unknown>
}

export type BaseSwiperEmits = {
  init: [swiper: import('swiper').Swiper]
  slideChange: [index: number, swiper: import('swiper').Swiper]
  reachBeginning: [swiper: import('swiper').Swiper]
  reachEnd: [swiper: import('swiper').Swiper]
  autoplayStart: []
  autoplayStop: []
}
