<script setup lang="ts">
import type { CustomerAddress } from '@modules/checkout/types'

defineProps<{
  address: CustomerAddress
  selected: boolean
}>()

const emit = defineEmits<{
  select: []
  edit: []
}>()

const { t } = useI18n()

function formatPhone(countryCode: string, phone: string) {
  const dial = countryCode.replace(/^0+/, '')
  return dial ? `+${dial}${phone}` : phone
}
</script>

<template>
  <article
    class="overflow-hidden rounded-2xl border bg-white transition-all duration-250 dark:bg-surface-elevated"
    :class="
      selected
        ? 'border-ibbil-green shadow-[0_12px_28px_-18px_rgba(45,83,61,0.45)] ring-1 ring-ibbil-green/20'
        : 'border-ibbil-green/10 hover:border-ibbil-green/25'
    "
  >
    <div class="flex items-stretch gap-2 p-3 sm:gap-3 sm:p-4">
      <button
        type="button"
        class="flex min-w-0 flex-1 items-start gap-3 text-start"
        :aria-pressed="selected"
        @click="emit('select')"
      >
        <span
          class="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
          :class="selected ? 'border-ibbil-green bg-ibbil-green' : 'border-ibbil-green/30'"
          aria-hidden="true"
        >
          <Icon
            v-if="selected"
            name="lucide:check"
            class="size-3 text-white"
          />
        </span>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-sm font-extrabold text-ibbil-green sm:text-base">
              {{ address.name }}
            </h3>
            <span
              v-if="address.isDefault"
              class="rounded-md bg-ibbil-green/10 px-2 py-0.5 text-[11px] font-bold text-ibbil-green"
            >
              {{ t('site.commerce.checkout.defaultAddress') }}
            </span>
          </div>

          <p class="mt-1.5 text-sm tabular-nums text-foreground-muted" dir="ltr">
            {{ formatPhone(address.countryCode, address.phone) }}
          </p>

          <p class="mt-1 text-sm leading-relaxed text-foreground-muted">
            {{ address.address }}
          </p>
        </div>
      </button>

      <button
        type="button"
        class="inline-flex shrink-0 self-start items-center gap-1.5 rounded-lg border border-ibbil-green/15 px-2.5 py-1.5 text-xs font-bold text-ibbil-green transition-colors hover:bg-ibbil-green/[0.06]"
        @click="emit('edit')"
      >
        <Icon name="lucide:pencil" class="size-3.5" aria-hidden="true" />
        {{ t('site.commerce.checkout.editAddress') }}
      </button>
    </div>
  </article>
</template>
