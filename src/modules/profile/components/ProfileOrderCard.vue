<script setup lang="ts">
import type { CustomerOrder } from '@modules/checkout/types'
import type { ComponentVariant } from '@shared/types/ui'
import { cn } from '@shared/utils/cn'

const props = defineProps<{
  item: CustomerOrder
  expanded?: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const { t, te } = useI18n()

const statusVariant = computed<ComponentVariant>(() => {
  switch (props.item.status) {
    case 'completed':
    case 'delivered':
      return 'success'
    case 'cancelled':
      return 'danger'
    case 'processing':
    case 'shipped':
      return 'info'
    case 'pending':
    default:
      return 'warning'
  }
})

const statusLabel = computed(() => {
  const key = `site.profile.marketplace.status.${props.item.status}`
  return te(key) ? t(key) : props.item.status
})

const productsPreview = computed(() => props.item.products.slice(0, 3))
const extraProductsCount = computed(() =>
  Math.max(0, props.item.products.length - productsPreview.value.length),
)
</script>

<template>
  <article
    :class="cn(
      'group relative overflow-hidden rounded-2xl border border-ibbil-green/15 bg-white shadow-[0_10px_28px_-22px_rgba(45,83,61,0.45)] transition-all duration-300 hover:border-ibbil-green/35 dark:bg-surface-elevated',
    )"
  >
    <div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
      <div class="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <div
          class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-[#fafbfa] sm:size-16"
        >
          <img
            v-if="item.store.logo"
            :src="item.store.logo"
            :alt="item.store.name"
            class="size-full object-contain p-1.5"
            loading="lazy"
          >
          <Icon
            v-else
            name="lucide:store"
            class="size-7 text-ibbil-green/50"
            aria-hidden="true"
          />
        </div>

        <div class="min-w-0">
          <p class="truncate text-sm font-bold text-ibbil-green sm:text-base">
            {{ item.store.name || t('site.profile.marketplace.card.unknownStore') }}
          </p>
          <p class="mt-0.5 text-xs text-foreground-muted sm:text-sm">
            {{ t('site.profile.marketplace.card.orderNumber', { num: item.orderNum }) }}
          </p>
          <p v-if="item.createdAt" class="mt-0.5 text-xs text-foreground-muted">
            {{ t('site.profile.marketplace.card.orderedAt', { date: item.createdAt }) }}
          </p>
        </div>
      </div>

      <div class="flex min-w-0 flex-1 flex-col gap-1.5 sm:items-center sm:text-center">
        <p class="text-xs text-foreground-muted sm:text-sm">
          {{ t('site.profile.marketplace.card.productsCount', { count: item.products.length }) }}
        </p>
        <p class="text-sm font-semibold text-foreground">
          <span class="font-medium text-foreground-muted">
            {{ t('site.profile.marketplace.card.total') }}:
          </span>
          <MoneyAmount :amount="item.totalAmount" class="ms-1" />
        </p>
      </div>

      <div class="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
        <BaseBadge :variant="statusVariant" size="sm">
          {{ statusLabel }}
        </BaseBadge>

        <BaseButton
          variant="ghost"
          size="sm"
          class="!rounded-xl !px-2"
          :aria-expanded="expanded"
          :aria-label="
            expanded
              ? t('site.profile.marketplace.card.collapse')
              : t('site.profile.marketplace.card.expand')
          "
          @click="emit('toggle')"
        >
          <Icon
            name="lucide:chevron-down"
            class="size-5 text-foreground-muted transition-transform duration-300"
            :class="expanded && 'rotate-180'"
            aria-hidden="true"
          />
        </BaseButton>
      </div>
    </div>

    <div
      v-if="productsPreview.length"
      class="flex items-center gap-2 border-t border-border/70 px-4 py-3 sm:px-5"
    >
      <div
        v-for="product in productsPreview"
        :key="product.id"
        class="relative size-11 overflow-hidden rounded-lg border border-border bg-[#fafbfa] sm:size-12"
      >
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.name"
          class="size-full object-cover"
          loading="lazy"
        >
        <div
          v-else
          class="flex size-full items-center justify-center"
        >
          <Icon name="lucide:package" class="size-4 text-ibbil-green/40" aria-hidden="true" />
        </div>
      </div>
      <span
        v-if="extraProductsCount > 0"
        class="flex size-11 items-center justify-center rounded-lg border border-dashed border-ibbil-green/25 text-xs font-semibold text-ibbil-green sm:size-12"
      >
        +{{ extraProductsCount }}
      </span>
    </div>

    <div
      v-show="expanded"
      class="border-t border-border bg-ibbil-green/[0.02] px-4 py-4 sm:px-5 sm:py-5"
    >
      <div class="grid gap-5 md:grid-cols-2">
        <section>
          <h4 class="mb-3 text-sm font-bold text-ibbil-green">
            {{ t('site.profile.marketplace.card.productsTitle') }}
          </h4>
          <ul class="space-y-3">
            <li
              v-for="product in item.products"
              :key="product.id"
              class="flex items-start gap-3"
            >
              <div
                class="size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-[#fafbfa]"
              >
                <img
                  v-if="product.image"
                  :src="product.image"
                  :alt="product.name"
                  class="size-full object-cover"
                  loading="lazy"
                >
                <div
                  v-else
                  class="flex size-full items-center justify-center"
                >
                  <Icon name="lucide:package" class="size-4 text-ibbil-green/40" aria-hidden="true" />
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-foreground">
                  {{ product.name || '—' }}
                </p>
                <p class="mt-0.5 inline-flex flex-wrap items-center gap-x-1 text-xs text-foreground-muted">
                  <span>{{ t('site.profile.marketplace.card.qty', { qty: product.qty }) }}</span>
                  <span>·</span>
                  <MoneyAmount :amount="product.price" />
                </p>
              </div>
            </li>
            <li
              v-if="item.products.length === 0"
              class="text-sm text-foreground-muted"
            >
              {{ t('site.profile.marketplace.card.noProducts') }}
            </li>
          </ul>
        </section>

        <section>
          <h4 class="mb-3 text-sm font-bold text-ibbil-green">
            {{ t('site.profile.marketplace.card.detailsTitle') }}
          </h4>
          <dl class="space-y-2.5 text-sm">
            <div class="flex justify-between gap-3">
              <dt class="text-foreground-muted">{{ t('site.profile.marketplace.card.subtotal') }}</dt>
              <dd class="font-medium text-foreground">
                <MoneyAmount :amount="item.subTotal" />
              </dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-foreground-muted">{{ t('site.profile.marketplace.card.discount') }}</dt>
              <dd class="font-medium text-foreground">
                <MoneyAmount :amount="item.discountAmount" />
              </dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-foreground-muted">{{ t('site.profile.marketplace.card.tax') }}</dt>
              <dd class="font-medium text-foreground">
                <MoneyAmount :amount="item.taxAmount" />
              </dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-foreground-muted">{{ t('site.profile.marketplace.card.shipping') }}</dt>
              <dd class="font-medium text-foreground">
                <MoneyAmount :amount="item.shippingAmount" />
              </dd>
            </div>
            <div class="flex justify-between gap-3 border-t border-border pt-2.5">
              <dt class="font-semibold text-ibbil-green">{{ t('site.profile.marketplace.card.total') }}</dt>
              <dd class="font-bold text-ibbil-green">
                <MoneyAmount :amount="item.totalAmount" />
              </dd>
            </div>
            <div class="flex justify-between gap-3 pt-1">
              <dt class="text-foreground-muted">{{ t('site.profile.marketplace.card.recipient') }}</dt>
              <dd class="font-medium text-foreground">{{ item.address.name || '—' }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-foreground-muted">{{ t('site.profile.marketplace.card.phone') }}</dt>
              <dd dir="ltr" class="text-end font-medium text-foreground">
                {{ item.address.phone || '—' }}
              </dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="shrink-0 text-foreground-muted">{{ t('site.profile.marketplace.card.address') }}</dt>
              <dd class="text-end font-medium text-foreground">{{ item.address.address || '—' }}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div
        v-if="item.invoiceUrl"
        class="mt-5 flex flex-wrap gap-2 border-t border-border pt-4"
      >
        <a
          :href="item.invoiceUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-xl border border-ibbil-green/20 bg-white px-3 py-2 text-sm font-medium text-ibbil-green transition-colors hover:bg-ibbil-green/[0.06] dark:bg-surface-elevated"
        >
          <Icon name="lucide:file-text" class="size-4" aria-hidden="true" />
          {{ t('site.profile.marketplace.card.invoice') }}
        </a>
      </div>
    </div>
  </article>
</template>
