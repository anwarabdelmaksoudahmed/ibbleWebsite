<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src: string
    alt?: string
    eager?: boolean
    aspectClass?: string
  }>(),
  {
    alt: '',
    eager: false,
    aspectClass: 'aspect-video',
  },
)

const root = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const shouldLoad = ref(props.eager)
const ready = ref(false)
const failed = ref(false)

useIntersectionObserver(
  root,
  ([entry]) => {
    if (entry?.isIntersecting) shouldLoad.value = true
  },
  { rootMargin: '240px 0px', threshold: 0.01 },
)

watch(shouldLoad, async (value) => {
  if (!value) return
  await nextTick()
  const el = videoRef.value
  if (!el) return
  try {
    el.preload = 'metadata'
    el.load()
  } catch {
    failed.value = true
  }
})
</script>

<template>
  <div
    ref="root"
    class="relative overflow-hidden bg-ibbil-green/[0.08]"
    :class="aspectClass"
  >
    <div
      v-if="!ready && !failed"
      class="absolute inset-0 animate-pulse bg-gradient-to-br from-ibbil-green/[0.1] via-transparent to-ibbil-gold/[0.08]"
      aria-hidden="true"
    />

    <video
      v-if="shouldLoad && src && !failed"
      ref="videoRef"
      :src="src"
      muted
      playsinline
      preload="none"
      class="h-full w-full object-cover transition-opacity duration-500"
      :class="ready ? 'opacity-100' : 'opacity-0'"
      :aria-label="alt"
      @loadeddata="ready = true"
      @loadedmetadata="ready = true"
      @error="failed = true"
    />

    <div
      v-if="failed || !src"
      class="absolute inset-0 flex items-center justify-center text-ibbil-green/35"
      aria-hidden="true"
    >
      <Icon name="lucide:video-off" class="size-8" />
    </div>

    <div
      class="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/45 via-black/10 to-transparent"
      aria-hidden="true"
    >
      <span
        class="inline-flex size-14 items-center justify-center rounded-full bg-white/95 text-ibbil-green shadow-lg shadow-black/20 ring-1 ring-white/60 backdrop-blur-sm sm:size-16"
      >
        <Icon name="lucide:play" class="ms-0.5 size-7 sm:size-8" />
      </span>
    </div>
  </div>
</template>
