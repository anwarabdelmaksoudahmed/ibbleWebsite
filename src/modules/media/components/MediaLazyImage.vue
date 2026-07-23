<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src: string
    alt: string
    eager?: boolean
    aspectClass?: string
    sizes?: string
    imgClass?: string
  }>(),
  {
    eager: false,
    aspectClass: 'aspect-[4/3]',
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    imgClass: '',
  },
)

const loaded = ref(false)
const failed = ref(false)
const root = ref<HTMLElement | null>(null)
const shouldLoad = ref(props.eager)

useIntersectionObserver(
  root,
  ([entry]) => {
    if (entry?.isIntersecting) shouldLoad.value = true
  },
  { rootMargin: '200px 0px', threshold: 0.01 },
)

watch(
  () => props.src,
  () => {
    loaded.value = false
    failed.value = false
    if (props.eager) shouldLoad.value = true
  },
)
</script>

<template>
  <div
    ref="root"
    class="relative overflow-hidden bg-ibbil-green/[0.06]"
    :class="aspectClass"
  >
    <div
      v-if="!loaded && !failed"
      class="absolute inset-0 animate-pulse bg-gradient-to-br from-ibbil-green/[0.08] via-ibbil-gold/[0.06] to-ibbil-green/[0.04]"
      aria-hidden="true"
    />

    <img
      v-if="shouldLoad && src && !failed"
      :src="src"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      decoding="async"
      :sizes="sizes"
      class="h-full w-full object-cover transition-all duration-500"
      :class="[imgClass, loaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0']"
      @load="loaded = true"
      @error="failed = true"
    >

    <div
      v-if="failed || !src"
      class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ibbil-green/[0.08] to-ibbil-gold/[0.06] text-ibbil-green/35"
      aria-hidden="true"
    >
      <Icon name="lucide:image-off" class="size-8" />
    </div>
  </div>
</template>
