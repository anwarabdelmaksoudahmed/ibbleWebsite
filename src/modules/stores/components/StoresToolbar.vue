<script setup lang="ts">
import type { MarketplaceCardVariant } from '@shared/types/marketplace-card'
import type { SelectOption } from '@shared/components/ui/BaseSelect.vue'

const props = withDefaults(
  defineProps<{
    view: MarketplaceCardVariant
    country?: string
    city?: string
    sort?: string
    showFilters?: boolean
    countryOptions?: SelectOption[]
    cityOptions?: SelectOption[]
    sortOptions?: SelectOption[]
  }>(),
  {
    country: '',
    city: '',
    sort: 'DESC',
    showFilters: true,
    countryOptions: () => [],
    cityOptions: () => [],
    sortOptions: () => [],
  },
)

const emit = defineEmits<{
  'update:view': [value: MarketplaceCardVariant]
  'update:country': [value: string]
  'update:city': [value: string]
  'update:sort': [value: string]
  search: []
}>()

const { t } = useI18n()

const resolvedSortOptions = computed<SelectOption[]>(() =>
  props.sortOptions.length
    ? props.sortOptions
    : [{ label: t('site.stores.filters.defaultSort'), value: 'default' }],
)

const resolvedCountryOptions = computed<SelectOption[]>(() =>
  props.countryOptions.length
    ? props.countryOptions
    : [{ label: t('site.stores.filters.all'), value: '' }],
)

const resolvedCityOptions = computed<SelectOption[]>(() =>
  props.cityOptions.length
    ? props.cityOptions
    : [{ label: t('site.stores.filters.all'), value: '' }],
)
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-2xl border border-ibbil-green/10 bg-white p-3 shadow-[0_10px_30px_-20px_rgba(45,83,61,0.35)] sm:p-4"
    :class="showFilters ? undefined : 'sm:flex-row sm:items-center sm:justify-end'"
  >
    <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div
        v-if="showFilters"
        class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <p class="shrink-0 text-sm font-bold text-ibbil-green sm:pb-2.5">
          {{ t('site.stores.filters.label') }}
        </p>

        <div class="grid min-w-0 flex-1 gap-2 sm:grid-cols-3 sm:gap-3">
          <BaseSelect
            :model-value="country"
            :options="resolvedCountryOptions"
            :placeholder="t('site.stores.filters.country')"
            size="sm"
            @update:model-value="emit('update:country', String($event))"
          />
          <BaseSelect
            :model-value="city"
            :options="resolvedCityOptions"
            :placeholder="t('site.stores.filters.city')"
            size="sm"
            @update:model-value="emit('update:city', String($event))"
          />
          <BaseSelect
            :model-value="sort"
            :options="resolvedSortOptions"
            :placeholder="t('site.stores.filters.defaultSort')"
            size="sm"
            @update:model-value="emit('update:sort', String($event))"
          />
        </div>
      </div>

      <div
        class="flex items-center gap-2"
        :class="showFilters ? 'justify-between sm:justify-end' : 'justify-end ms-auto'"
      >
        <button
          v-if="showFilters"
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-ibbil-green px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ibbil-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green focus-visible:ring-offset-2"
          @click="emit('search')"
        >
          <Icon name="lucide:search" class="h-4 w-4" aria-hidden="true" />
          {{ t('site.stores.filters.search') }}
        </button>

        <div
          class="inline-flex items-center rounded-xl border border-ibbil-green/15 bg-[#f7f9f8] p-1"
          role="group"
          :aria-label="t('site.stores.view.label')"
        >
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green"
            :class="
              view === 'list'
                ? 'bg-white text-ibbil-green shadow-sm'
                : 'text-foreground-muted hover:text-ibbil-green'
            "
            :aria-pressed="view === 'list'"
            :aria-label="t('site.stores.view.list')"
            @click="emit('update:view', 'list')"
          >
            <Icon name="lucide:list" class="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green"
            :class="
              view === 'grid'
                ? 'bg-white text-ibbil-green shadow-sm'
                : 'text-foreground-muted hover:text-ibbil-green'
            "
            :aria-pressed="view === 'grid'"
            :aria-label="t('site.stores.view.grid')"
            @click="emit('update:view', 'grid')"
          >
            <Icon name="lucide:layout-grid" class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
