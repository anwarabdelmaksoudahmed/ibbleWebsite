<script setup lang="ts">
import type { ComponentSize } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'

export type ImageGalleryAspectRatio = 'square' | '4/3' | '3/4' | '16/9'
export type ImageGalleryThumbnailPosition = 'inline-end' | 'inline-start' | 'bottom'

export type BaseImageGalleryProps = {
  images: string[]
  alt: string
  aspectRatio?: ImageGalleryAspectRatio
  objectFit?: 'cover' | 'contain'
  thumbnailPosition?: ImageGalleryThumbnailPosition
  thumbnailSize?: Extract<ComponentSize, 'sm' | 'md' | 'lg'>
  emptyIcon?: string
}

const props = withDefaults(defineProps<BaseImageGalleryProps>(), {
  aspectRatio: 'square',
  objectFit: 'contain',
  thumbnailPosition: 'inline-end',
  thumbnailSize: 'md',
  emptyIcon: 'lucide:image',
})

const { t } = useI18n()

const activeIndex = ref(0)

const hasMultiple = computed(() => props.images.length > 1)

const activeImage = computed(() => props.images[activeIndex.value] || '')

const aspectRatioClass = computed(() => {
  const ratios: Record<ImageGalleryAspectRatio, string> = {
    square: 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '3/4': 'aspect-[3/4]',
    '16/9': 'aspect-video',
  }
  return ratios[props.aspectRatio]
})

const thumbnailSizeClass = computed(() => {
  const sizes: Record<Extract<ComponentSize, 'sm' | 'md' | 'lg'>, string> = {
    sm: 'size-14 sm:size-16',
    md: 'size-16 sm:size-[4.5rem]',
    lg: 'size-20 sm:size-24',
  }
  return sizes[props.thumbnailSize]
})

const layoutClass = computed(() => {
  if (props.thumbnailPosition === 'bottom') {
    return 'flex-col'
  }
  if (props.thumbnailPosition === 'inline-start') {
    return 'flex-col sm:flex-row'
  }
  return 'flex-col sm:flex-row-reverse'
})

const thumbnailsLayoutClass = computed(() => {
  if (props.thumbnailPosition === 'bottom') {
    return 'flex-row overflow-x-auto pb-1'
  }
  return 'flex-row overflow-x-auto pb-1 sm:flex-col sm:overflow-y-auto sm:overflow-x-hidden sm:pb-0'
})

const imageFitClass = computed(() =>
  props.objectFit === 'cover' ? 'object-cover' : 'object-contain',
)

function selectImage(index: number) {
  if (index < 0 || index >= props.images.length) return
  activeIndex.value = index
}

function onImageError(event: Event) {
  const target = event.target as HTMLImageElement | null
  if (target) target.style.visibility = 'hidden'
}

watch(
  () => props.images,
  (images) => {
    if (activeIndex.value >= images.length) {
      activeIndex.value = 0
    }
  },
)
</script>

<template>
  <div class="flex gap-3 sm:gap-4" :class="layoutClass">
    <div class="min-w-0 flex-1">
      <div
        class="relative w-full overflow-hidden rounded-2xl border border-ibbil-green/10 bg-gradient-to-br from-ibbil-green/[0.06] to-ibbil-green/[0.02] dark:border-ibbil-green/20"
        :class="aspectRatioClass"
      >
        <img
          v-if="activeImage"
          :key="activeImage"
          :src="activeImage"
          :alt="alt"
          :class="cn('absolute inset-0 h-full w-full', imageFitClass)"
          loading="eager"
          fetchpriority="high"
          @error="onImageError"
        >
        <div
          v-else
          class="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <Icon :name="emptyIcon" class="size-16 text-ibbil-green/25" />
        </div>
      </div>
    </div>

    <div
      v-if="hasMultiple"
      class="flex shrink-0 gap-2"
      :class="thumbnailsLayoutClass"
      role="list"
      :aria-label="t('common.imageGallery.thumbnails')"
    >
      <button
        v-for="(image, index) in images"
        :key="`${image}-${index}`"
        type="button"
        role="listitem"
        class="relative shrink-0 overflow-hidden rounded-xl border-2 bg-gradient-to-br from-ibbil-green/[0.06] to-ibbil-green/[0.02] p-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-gold focus-visible:ring-offset-2"
        :class="[
          thumbnailSizeClass,
          index === activeIndex
            ? 'border-ibbil-gold shadow-sm'
            : 'border-ibbil-green/10 opacity-75 hover:border-ibbil-green/30 hover:opacity-100 dark:border-ibbil-green/20',
        ]"
        :aria-label="t('common.imageGallery.selectImage', { index: index + 1 })"
        :aria-current="index === activeIndex ? 'true' : undefined"
        @click="selectImage(index)"
      >
        <img
          :src="image"
          :alt="`${alt} ${index + 1}`"
          :class="cn('absolute inset-0 h-full w-full', imageFitClass)"
          loading="lazy"
        >
      </button>
    </div>
  </div>
</template>
