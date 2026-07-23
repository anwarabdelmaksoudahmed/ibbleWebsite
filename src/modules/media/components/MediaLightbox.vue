<script setup lang="ts">
import { onKeyStroke, useScrollLock } from '@vueuse/core'
import type { MediaAsset } from '@modules/media/types'

const props = defineProps<{
  open: boolean
  items: MediaAsset[]
  index: number
  title?: string
}>()

const emit = defineEmits<{
  close: []
  'update:open': [value: boolean]
  'update:index': [value: number]
}>()

const { t, locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')
const body = import.meta.client ? document.body : null
const isLocked = useScrollLock(body)

const current = computed(() => props.items[props.index] ?? null)
const hasPrev = computed(() => props.index > 0)
const hasNext = computed(() => props.index < props.items.length - 1)
const counter = computed(() =>
  t('site.media.lightbox.counter', {
    current: props.index + 1,
    total: props.items.length,
  }),
)

watch(
  () => props.open,
  (value) => {
    isLocked.value = value
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  isLocked.value = false
})

function close() {
  emit('close')
  emit('update:open', false)
}

function go(delta: number) {
  const next = props.index + delta
  if (next < 0 || next >= props.items.length) return
  emit('update:index', next)
}

onKeyStroke('Escape', () => {
  if (props.open) close()
})

onKeyStroke('ArrowLeft', () => {
  if (!props.open) return
  go(isRtl.value ? 1 : -1)
})

onKeyStroke('ArrowRight', () => {
  if (!props.open) return
  go(isRtl.value ? -1 : 1)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="media-lightbox">
      <div
        v-if="open && current"
        class="fixed inset-0 z-[80] flex flex-col bg-black/92 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        :aria-label="title || t('site.media.lightbox.label')"
      >
        <div class="flex items-center justify-between gap-3 px-4 py-3 text-white sm:px-6">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold sm:text-base">
              {{ title || current.title || t('site.media.lightbox.label') }}
            </p>
            <p class="text-xs text-white/65">{{ counter }}</p>
          </div>
          <button
            type="button"
            class="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-gold"
            :aria-label="t('site.media.lightbox.close')"
            @click="close"
          >
            <Icon name="lucide:x" class="size-5" />
          </button>
        </div>

        <div class="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-12">
          <button
            v-if="hasPrev"
            type="button"
            class="absolute start-2 z-10 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-gold sm:start-4"
            :aria-label="t('site.media.lightbox.prev')"
            @click="go(-1)"
          >
            <Icon :name="isRtl ? 'lucide:chevron-right' : 'lucide:chevron-left'" class="size-6" />
          </button>

          <button
            v-if="hasNext"
            type="button"
            class="absolute end-2 z-10 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-gold sm:end-4"
            :aria-label="t('site.media.lightbox.next')"
            @click="go(1)"
          >
            <Icon :name="isRtl ? 'lucide:chevron-left' : 'lucide:chevron-right'" class="size-6" />
          </button>

          <div class="flex max-h-full w-full max-w-6xl items-center justify-center">
            <video
              v-if="current.kind === 'video'"
              :key="current.id"
              :src="current.url"
              controls
              playsinline
              autoplay
              class="max-h-[78vh] w-full rounded-xl bg-black object-contain"
            />
            <img
              v-else
              :key="current.id"
              :src="current.url"
              :alt="current.title || title || ''"
              class="max-h-[78vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
              decoding="async"
            >
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.media-lightbox-enter-active,
.media-lightbox-leave-active {
  transition: opacity 0.2s ease;
}

.media-lightbox-enter-from,
.media-lightbox-leave-to {
  opacity: 0;
}
</style>
