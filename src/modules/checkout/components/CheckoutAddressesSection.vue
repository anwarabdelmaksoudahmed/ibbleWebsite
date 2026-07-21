<script setup lang="ts">
import CheckoutAddressCard from '@modules/checkout/components/CheckoutAddressCard.vue'
import type { CustomerAddress } from '@modules/checkout/types'

defineProps<{
  addresses: CustomerAddress[]
  selectedId: string | null
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  add: []
  edit: [address: CustomerAddress]
}>()

const { t } = useI18n()
</script>

<template>
  <section
    class="checkout-panel overflow-hidden rounded-2xl border border-ibbil-green/10 bg-white shadow-[0_10px_32px_-22px_rgba(45,83,61,0.35)] dark:border-ibbil-green/20 dark:bg-surface-elevated"
    :aria-label="t('site.commerce.checkout.addressesTitle')"
  >
    <header
      class="flex flex-wrap items-center justify-between gap-3 border-b border-ibbil-green/10 bg-gradient-to-l from-ibbil-green/[0.07] via-transparent to-ibbil-gold/[0.05] px-4 py-4 sm:px-5"
    >
      <div>
        <h2 class="text-base font-extrabold text-ibbil-green sm:text-lg">
          {{ t('site.commerce.checkout.addressesTitle') }}
        </h2>
        <p class="mt-0.5 text-xs text-foreground-muted">
          {{ t('site.commerce.checkout.addressesHint') }}
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-xl border border-ibbil-green/20 bg-white px-3 py-2 text-sm font-bold text-ibbil-green transition-colors hover:bg-ibbil-green/[0.06]"
        @click="emit('add')"
      >
        <Icon name="lucide:plus" class="size-4" aria-hidden="true" />
        {{ t('site.commerce.checkout.addNewAddress') }}
      </button>
    </header>

    <div class="space-y-3 p-4 sm:p-5">
      <div
        v-if="loading"
        class="space-y-3"
      >
        <div
          v-for="i in 2"
          :key="i"
          class="h-24 animate-pulse rounded-2xl bg-ibbil-green/[0.06]"
        />
      </div>

      <BaseEmptyState
        v-else-if="!addresses.length"
        variant="brand"
        class="!py-8"
        :title="t('site.commerce.checkout.noAddressesTitle')"
        :description="t('site.commerce.checkout.noAddressesDescription')"
        icon="lucide:map-pin"
      >
        <BaseButton
          class="!bg-ibbil-green !text-white hover:!bg-ibbil-green-dark"
          @click="emit('add')"
        >
          {{ t('site.commerce.checkout.addNewAddress') }}
        </BaseButton>
      </BaseEmptyState>

      <CheckoutAddressCard
        v-for="(address, index) in addresses"
        v-else
        :key="address.id"
        :address="address"
        :selected="address.id === selectedId"
        class="checkout-address-enter"
        :style="{ animationDelay: `${index * 60}ms` }"
        @select="emit('select', address.id)"
        @edit="emit('edit', address)"
      />
    </div>
  </section>
</template>

<style scoped>
.checkout-address-enter {
  animation: checkout-address-enter 0.45s ease both;
}

@keyframes checkout-address-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .checkout-address-enter {
    animation: none;
  }
}
</style>
