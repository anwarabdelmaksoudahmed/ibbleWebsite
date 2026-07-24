<script setup lang="ts">
/**
 * Legacy/deep-link route — payment now lives on register wizard step 3.
 * Keep this page as a redirect for any old bookmarks.
 */
import { TRANSPORT_ROUTES } from '@modules/transport/constants/routes'
import {
  readTripPaymentSnapshot,
  saveTripPaymentSnapshot,
} from '@modules/transport/utils/trip-payment-snapshot'

definePageMeta({
  layout: 'site',
  middleware: ['auth'],
  ssr: false,
})

const route = useRoute()
const localePath = useLocalePath()

const tripId = computed(() => String(route.params.id || '').trim())

onMounted(async () => {
  const id = tripId.value
  if (id && !readTripPaymentSnapshot(id)) {
    saveTripPaymentSnapshot({
      tripId: id,
      vehicleId: '',
      price: Number(route.query.price) || 0,
    })
  }
  await navigateTo(localePath(TRANSPORT_ROUTES.REGISTER), { replace: true })
})
</script>

<template>
  <div class="flex min-h-[40vh] items-center justify-center text-sm text-foreground-muted">
    …
  </div>
</template>
