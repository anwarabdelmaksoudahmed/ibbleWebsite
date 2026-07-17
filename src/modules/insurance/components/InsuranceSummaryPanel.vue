<script setup lang="ts">
export type InsuranceSummaryField = {
  label: string
  value: string
  /** Emphasize the value (e.g. total cargo value in gold). */
  highlight?: boolean
  /** Force LTR for phone / email / numeric values. */
  dir?: 'ltr' | 'rtl' | 'auto'
  /** Span extra columns on wider breakpoints (long labels / addresses). */
  wide?: boolean
}

const props = withDefaults(
  defineProps<{
    title: string
    fields: InsuranceSummaryField[]
    defaultOpen?: boolean
  }>(),
  {
    defaultOpen: true,
  },
)

const open = ref(props.defaultOpen)
const panelId = useId()
const contentId = `${panelId}-content`

function toggle() {
  open.value = !open.value
}
</script>

<template>
  <section
    class="overflow-hidden rounded-2xl border border-ibbil-green/15 bg-white shadow-[0_10px_28px_-22px_rgba(45,83,61,0.4)] dark:bg-surface-elevated"
  >
    <h3 class="m-0">
      <button
        type="button"
        class="flex w-full items-center justify-between gap-3 bg-ibbil-green px-4 py-3.5 text-start text-sm font-extrabold text-white transition-colors hover:bg-ibbil-green-dark sm:px-5 sm:text-base"
        :aria-expanded="open"
        :aria-controls="contentId"
        @click="toggle"
      >
        <span>{{ title }}</span>
        <Icon
          name="lucide:chevron-down"
          class="size-5 shrink-0 transition-transform duration-250"
          :class="open ? 'rotate-180' : ''"
          aria-hidden="true"
        />
      </button>
    </h3>

    <div
      :id="contentId"
      class="grid transition-[grid-template-rows] duration-250 ease-out"
      :class="open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
    >
      <div class="overflow-hidden">
        <dl
          class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5 sm:p-5 lg:grid-cols-3"
        >
          <div
            v-for="(field, index) in fields"
            :key="`${field.label}-${index}`"
            class="flex min-w-0 flex-col gap-1"
            :class="field.wide ? 'sm:col-span-2 lg:col-span-2' : undefined"
          >
            <dt class="text-xs font-medium text-foreground-muted sm:text-sm">
              {{ field.label }}
            </dt>
            <dd
              class="m-0 break-words text-sm font-bold text-foreground [overflow-wrap:anywhere] sm:text-base"
              :class="field.highlight ? 'text-ibbil-gold' : undefined"
            >
              <bdi v-if="field.dir" :dir="field.dir">{{ field.value || '—' }}</bdi>
              <template v-else>{{ field.value || '—' }}</template>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>
