<script setup lang="ts">
import { PAYMENT_CALLBACK_MESSAGE_TYPE } from '@shared/payment/constants/providers'

definePageMeta({
  layout: false,
})

const route = useRoute()

onMounted(() => {
  if (!import.meta.client) return

  const resourcePath = normalizeQueryValue(route.query.resourcePath)
  const checkoutId = normalizeQueryValue(route.query.id)

  if (window.parent !== window) {
    window.parent.postMessage(
      {
        type: PAYMENT_CALLBACK_MESSAGE_TYPE,
        resourcePath,
        checkoutId,
      },
      window.location.origin,
    )
  }
})

function normalizeQueryValue(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-surface p-6">
    <BaseLoader block show-label />
  </div>
</template>
