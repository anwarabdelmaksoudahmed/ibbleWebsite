<script setup lang="ts">
const { t, locale } = useI18n()
const config = useRuntimeConfig()

const message = computed(() =>
  locale.value === 'ar'
    ? 'مرحباً، أود الاستفسار عن خدمات منصة إبل'
    : 'Hello, I would like to inquire about Ibbil platform services',
)

const href = computed(() => {
  const text = encodeURIComponent(message.value)
  return `https://wa.me/${config.public.whatsappNumber}?text=${text}`
})
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="fixed end-5 bottom-5 z-40 inline-flex size-14 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform duration-250 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 md:end-8 md:bottom-8"
    :aria-label="t('site.whatsapp.cta')"
  >
    <Icon name="simple-icons:whatsapp" class="size-7" aria-hidden="true" />
  </a>
</template>
