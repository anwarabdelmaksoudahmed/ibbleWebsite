<script setup lang="ts" generic="T = unknown">
import {
  A11y,
  Autoplay,
  EffectFade,
  FreeMode,
  Keyboard,
  Mousewheel,
  Navigation,
  Pagination,
} from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { Swiper as SwiperInstance } from 'swiper'
import type {
  BaseSwiperEmits,
  BaseSwiperProps,
  SwiperAutoplayOptions,
} from '@shared/types/swiper'
import { cn } from '@shared/utils/cn'

import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/free-mode'

const props = withDefaults(defineProps<BaseSwiperProps & { items?: T[] }>(), {
  items: () => [],
  effect: 'slide',
  loop: false,
  speed: 600,
  initialSlide: 0,
  autoplay: false,
  slidesPerView: 1,
  spaceBetween: 0,
  centeredSlides: false,
  grabCursor: true,
  freeMode: false,
  watchOverflow: true,
  navigation: true,
  pagination: 'bullets',
  keyboard: true,
  mousewheel: false,
  kenBurns: false,
  controlsVariant: 'brand',
  controlsPosition: 'overlay-bottom',
  clientOnly: true,
})

const emit = defineEmits<BaseSwiperEmits>()

defineSlots<{
  default?: (props: { item: T; index: number }) => unknown
  slide?: (props: { item: T; index: number }) => unknown
  overlay?: (props: { activeIndex: number; total: number }) => unknown
  fallback?: () => unknown
  controls?: (props: {
    prevId: string
    nextId: string
    paginationId: string
    activeIndex: number
    total: number
  }) => unknown
}>()

const { t, localeProperties } = useI18n()
const prefersReducedMotion = usePreferredReducedMotion()

const instanceId = useId().replace(/:/g, '')
const prevId = `base-swiper-prev-${instanceId}`
const nextId = `base-swiper-next-${instanceId}`
const paginationId = `base-swiper-pagination-${instanceId}`

const swiperRef = shallowRef<SwiperInstance | null>(null)
const activeIndex = ref(props.initialSlide)

const isRtl = computed(() => localeProperties.value.dir === 'rtl')
const total = computed(() => props.items.length)

const resolvedHeight = computed(() => {
  if (props.height == null) return undefined
  return typeof props.height === 'number' ? `${props.height}px` : props.height
})

const modules = computed(() => {
  const list = [A11y]
  if (props.effect === 'fade') list.push(EffectFade)
  if (props.autoplay) list.push(Autoplay)
  if (props.navigation) list.push(Navigation)
  if (props.pagination) list.push(Pagination)
  if (props.keyboard) list.push(Keyboard)
  if (props.mousewheel) list.push(Mousewheel)
  if (props.freeMode) list.push(FreeMode)
  return list
})

const autoplayConfig = computed(() => {
  if (!props.autoplay || prefersReducedMotion.value === 'reduce') return false

  const defaults: SwiperAutoplayOptions = {
    delay: 5000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  }

  if (props.autoplay === true) return defaults
  return { ...defaults, ...props.autoplay }
})

const paginationConfig = computed(() => {
  if (!props.pagination) return false

  const type = props.pagination === true ? 'bullets' : props.pagination
  return {
    el: `#${paginationId}`,
    clickable: true,
    type,
  }
})

const navigationConfig = computed(() => {
  if (!props.navigation) return false
  return {
    prevEl: `#${prevId}`,
    nextEl: `#${nextId}`,
  }
})

const a11yConfig = computed(() => ({
  enabled: true,
  prevSlideMessage: props.prevLabel || t('common.previous'),
  nextSlideMessage: props.nextLabel || t('common.next'),
  paginationBulletMessage: isRtl.value
    ? 'الانتقال إلى الشريحة {{index}}'
    : 'Go to slide {{index}}',
}))

const rootStyle = computed(() =>
  resolvedHeight.value ? { height: resolvedHeight.value } : undefined,
)

const controlsVariantClass = computed(() => {
  switch (props.controlsVariant) {
    case 'light':
      return 'base-swiper--controls-light'
    case 'dark':
      return 'base-swiper--controls-dark'
    default:
      return 'base-swiper--controls-brand'
  }
})

function onSwiper(swiper: SwiperInstance) {
  swiperRef.value = swiper
  activeIndex.value = swiper.realIndex
  emit('init', swiper)
}

function onSlideChange(swiper: SwiperInstance) {
  activeIndex.value = swiper.realIndex
  emit('slideChange', swiper.realIndex, swiper)
}

function onReachBeginning(swiper: SwiperInstance) {
  emit('reachBeginning', swiper)
}

function onReachEnd(swiper: SwiperInstance) {
  emit('reachEnd', swiper)
}

function slideNext() {
  swiperRef.value?.slideNext()
}

function slidePrev() {
  swiperRef.value?.slidePrev()
}

function slideTo(index: number, speed?: number) {
  if (props.loop) {
    swiperRef.value?.slideToLoop(index, speed)
    return
  }
  swiperRef.value?.slideTo(index, speed)
}

function startAutoplay() {
  swiperRef.value?.autoplay?.start()
}

function stopAutoplay() {
  swiperRef.value?.autoplay?.stop()
}

defineExpose({
  swiper: swiperRef,
  activeIndex,
  slideNext,
  slidePrev,
  slideTo,
  startAutoplay,
  stopAutoplay,
})
</script>

<template>
  <div
    :class="
      cn(
        'base-swiper relative w-full overflow-hidden',
        kenBurns && 'base-swiper--ken-burns',
        controlsVariantClass,
        `base-swiper--controls-${controlsPosition}`,
        props.class,
      )
    "
    :style="rootStyle"
    :dir="isRtl ? 'rtl' : 'ltr'"
    role="region"
    :aria-roledescription="'carousel'"
    :aria-label="label || t('common.swiper.label')"
  >
    <ClientOnly v-if="clientOnly">
      <div class="h-full w-full">
        <Swiper
          :class="cn('h-full w-full', swiperClass)"
          :modules="modules"
          :dir="isRtl ? 'rtl' : 'ltr'"
          :effect="effect"
          :fade-effect="effect === 'fade' ? { crossFade: true } : undefined"
          :loop="loop && total > 1"
          :speed="prefersReducedMotion === 'reduce' ? 0 : speed"
          :initial-slide="initialSlide"
          :autoplay="autoplayConfig"
          :slides-per-view="slidesPerView"
          :space-between="spaceBetween"
          :centered-slides="centeredSlides"
          :grab-cursor="grabCursor"
          :free-mode="freeMode"
          :watch-overflow="watchOverflow"
          :breakpoints="breakpoints"
          :keyboard="keyboard ? { enabled: true } : false"
          :mousewheel="mousewheel"
          :pagination="paginationConfig"
          :navigation="navigationConfig"
          :a11y="a11yConfig"
          v-bind="options"
          @swiper="onSwiper"
          @slide-change="onSlideChange"
          @reach-beginning="onReachBeginning"
          @reach-end="onReachEnd"
          @autoplay-start="emit('autoplayStart')"
          @autoplay-stop="emit('autoplayStop')"
        >
          <SwiperSlide v-for="(item, index) in items" :key="index" class="!h-full">
            <div class="h-full w-full">
              <slot name="slide" :item="item" :index="index">
                <slot :item="item" :index="index" />
              </slot>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      <template #fallback>
        <div class="h-full w-full">
          <slot name="fallback">
            <slot v-if="items[0]" name="slide" :item="items[0]" :index="0">
              <slot :item="items[0]" :index="0" />
            </slot>
          </slot>
        </div>
      </template>
    </ClientOnly>

    <Swiper
      v-else
      :class="cn('h-full w-full', swiperClass)"
      :modules="modules"
      :dir="isRtl ? 'rtl' : 'ltr'"
      :effect="effect"
      :fade-effect="effect === 'fade' ? { crossFade: true } : undefined"
      :loop="loop && total > 1"
      :speed="prefersReducedMotion === 'reduce' ? 0 : speed"
      :initial-slide="initialSlide"
      :autoplay="autoplayConfig"
      :slides-per-view="slidesPerView"
      :space-between="spaceBetween"
      :centered-slides="centeredSlides"
      :grab-cursor="grabCursor"
      :free-mode="freeMode"
      :watch-overflow="watchOverflow"
      :breakpoints="breakpoints"
      :keyboard="keyboard ? { enabled: true } : false"
      :mousewheel="mousewheel"
      :pagination="paginationConfig"
      :navigation="navigationConfig"
      :a11y="a11yConfig"
      v-bind="options"
      @swiper="onSwiper"
      @slide-change="onSlideChange"
      @reach-beginning="onReachBeginning"
      @reach-end="onReachEnd"
      @autoplay-start="emit('autoplayStart')"
      @autoplay-stop="emit('autoplayStop')"
    >
      <SwiperSlide v-for="(item, index) in items" :key="index">
        <slot name="slide" :item="item" :index="index">
          <slot :item="item" :index="index" />
        </slot>
      </SwiperSlide>
    </Swiper>

    <div v-if="$slots.overlay" class="pointer-events-none absolute inset-0 z-[1]">
      <slot name="overlay" :active-index="activeIndex" :total="total" />
    </div>

    <template v-if="navigation || pagination">
      <slot
        name="controls"
        :prev-id="prevId"
        :next-id="nextId"
        :pagination-id="paginationId"
        :active-index="activeIndex"
        :total="total"
      >
        <div
          :class="
            cn(
              'base-swiper__controls pointer-events-auto z-[2] flex items-center gap-3',
              controlsPosition === 'outside' && 'relative mt-3',
              controlsPosition === 'inside' && 'absolute inset-x-0 bottom-3 px-3',
              controlsPosition === 'overlay-bottom' && 'absolute inset-x-0 bottom-3 px-4 sm:bottom-4 sm:px-6',
            )
          "
        >
          <div
            v-if="pagination"
            :id="paginationId"
            class="base-swiper__pagination flex flex-1 items-center gap-1.5"
          />

          <div v-if="navigation" class="base-swiper__nav ms-auto flex shrink-0 items-center gap-1.5">
            <button
              :id="prevId"
              type="button"
              class="base-swiper__nav-btn"
              :aria-label="prevLabel || t('common.previous')"
            >
              <DirectionalArrow direction="back" variant="chevron" />
            </button>
            <button
              :id="nextId"
              type="button"
              class="base-swiper__nav-btn"
              :aria-label="nextLabel || t('common.next')"
            >
              <DirectionalArrow variant="chevron" />
            </button>
          </div>
        </div>
      </slot>
    </template>

    <p class="sr-only" aria-live="polite">
      {{ t('common.swiper.slideStatus', { current: activeIndex + 1, total }) }}
    </p>
  </div>
</template>

<style scoped>
.base-swiper :deep(.swiper),
.base-swiper :deep(.swiper-wrapper),
.base-swiper :deep(.swiper-slide) {
  height: 100%;
}

.base-swiper :deep(.swiper-fade .swiper-slide) {
  pointer-events: none;
}

.base-swiper :deep(.swiper-fade .swiper-slide-active) {
  pointer-events: auto;
}

.base-swiper__nav-btn {
  display: inline-flex;
  height: 2.25rem;
  width: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid transparent;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}

.base-swiper__nav-btn:hover {
  transform: translateY(-1px);
}

.base-swiper__nav-btn.swiper-button-disabled {
  opacity: 0.35;
  pointer-events: none;
}

.base-swiper--controls-brand .base-swiper__nav-btn {
  border-color: rgb(255 255 255 / 0.28);
  background: rgb(255 255 255 / 0.12);
  color: white;
  backdrop-filter: blur(8px);
}

.base-swiper--controls-brand .base-swiper__nav-btn:hover {
  border-color: color-mix(in oklab, var(--color-ibbil-gold) 55%, white);
  background: rgb(255 255 255 / 0.22);
}

.base-swiper--controls-light .base-swiper__nav-btn {
  border-color: rgb(255 255 255 / 0.35);
  background: rgb(255 255 255 / 0.85);
  color: var(--color-ibbil-green-dark);
}

.base-swiper--controls-dark .base-swiper__nav-btn {
  border-color: rgb(0 0 0 / 0.08);
  background: rgb(0 0 0 / 0.55);
  color: white;
}

.base-swiper :deep(.base-swiper__pagination .swiper-pagination-bullet) {
  width: 0.4rem;
  height: 0.4rem;
  margin: 0 !important;
  opacity: 1;
  border-radius: 9999px;
  transition:
    width 0.25s ease,
    background-color 0.25s ease;
}

.base-swiper--controls-brand :deep(.base-swiper__pagination .swiper-pagination-bullet) {
  background: rgb(255 255 255 / 0.45);
}

.base-swiper--controls-brand :deep(.base-swiper__pagination .swiper-pagination-bullet-active) {
  width: 1.5rem;
  background: var(--color-ibbil-gold);
}

.base-swiper--controls-light :deep(.base-swiper__pagination .swiper-pagination-bullet) {
  background: rgb(255 255 255 / 0.55);
}

.base-swiper--controls-light :deep(.base-swiper__pagination .swiper-pagination-bullet-active) {
  width: 1.5rem;
  background: white;
}

.base-swiper--controls-dark :deep(.base-swiper__pagination .swiper-pagination-bullet) {
  background: rgb(0 0 0 / 0.25);
}

.base-swiper--controls-dark :deep(.base-swiper__pagination .swiper-pagination-bullet-active) {
  width: 1.5rem;
  background: var(--color-ibbil-green);
}

.base-swiper--ken-burns :deep(.swiper-slide img) {
  transform: scale(1.06);
  transition: transform 6s ease-out;
}

.base-swiper--ken-burns :deep(.swiper-slide-active img) {
  transform: scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .base-swiper--ken-burns :deep(.swiper-slide img),
  .base-swiper--ken-burns :deep(.swiper-slide-active img) {
    transform: none;
    transition: none;
  }
}
</style>
