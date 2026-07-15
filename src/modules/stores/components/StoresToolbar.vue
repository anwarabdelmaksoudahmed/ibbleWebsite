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
  <form
    class="rounded-2xl border border-ibbil-green/10 bg-white p-3 shadow-sm sm:p-4"
    @submit.prevent="emit('search')"
  >
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      :class="showFilters ? undefined : 'justify-end'"
    >
      <div
        v-if="showFilters"
        class="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <BaseSelect
          :model-value="country"
          :options="resolvedCountryOptions"
          :label="t('site.stores.filters.country')"
          size="sm"
          @update:model-value="emit('update:country', String($event))"
        >
          <template #prefix>
            <Icon name="lucide:globe" class="size-4" aria-hidden="true" />
          </template>
        </BaseSelect>

        <BaseSelect
          :model-value="city"
          :options="resolvedCityOptions"
          :label="t('site.stores.filters.city')"
          size="sm"
          @update:model-value="emit('update:city', String($event))"
        >
          <template #prefix>
            <Icon name="lucide:map-pin" class="size-4" aria-hidden="true" />
          </template>
        </BaseSelect>

        <BaseSelect
          :model-value="sort"
          :options="resolvedSortOptions"
          :label="t('site.stores.filters.x')"
          size="sm"
          root-class="sm:col-span-2 lg:col-span-1"
          @update:model-value="emit('update:sort', String($event))"
        >
          <template #prefix>
            <Icon name="lucide:arrow-up-down" class="size-4" aria-hidden="true" />
          </template>
        </BaseSelect>
      </div>

      <div class="flex shrink-0 items-center gap-2 sm:gap-3">
        <BaseButton
          v-if="showFilters"
          type="submit"
          variant="brand"
          size="sm"
          class="min-w-[6.5rem] flex-1 sm:flex-none"
        >
          <Icon name="lucide:search" class="size-4" aria-hidden="true" />
          {{ t('site.stores.filters.search') }}
        </BaseButton>

        <div
          class="inline-flex items-center rounded-xl border border-ibbil-green/12 bg-[#f7f9f8] p-1"
          role="group"
          :aria-label="t('site.stores.view.label')"
        >
          <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green"
            :class="
              view === 'list'
                ? 'bg-white text-ibbil-green shadow-sm'
                : 'text-foreground-muted hover:text-ibbil-green'
            "
            :aria-pressed="view === 'list'"
            :aria-label="t('site.stores.view.list')"
            @click="emit('update:view', 'list')"
          >
            <Icon name="lucide:list" class="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ibbil-green"
            :class="
              view === 'grid'
                ? 'bg-white text-ibbil-green shadow-sm'
                : 'text-foreground-muted hover:text-ibbil-green'
            "
            :aria-pressed="view === 'grid'"
            :aria-label="t('site.stores.view.grid')"
            @click="emit('update:view', 'grid')"
          >
            <Icon name="lucide:layout-grid" class="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </form>
</template>
