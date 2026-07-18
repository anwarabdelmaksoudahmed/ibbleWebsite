<script setup lang="ts">
import { cn } from '@shared/utils/cn'
import { formatMoneyAmount } from '@shared/utils/format-money'

const props = withDefaults(
  defineProps<{
    amount: number
    class?: string
    symbolClass?: string
  }>(),
  {
    symbolClass: 'text-[0.95em]',
  },
)

const { locale } = useI18n()

const formatted = computed(() => formatMoneyAmount(props.amount, locale.value))
</script>

<template>
  <span
    dir="ltr"
    :class="cn('inline-flex items-center gap-1 tabular-nums', props.class)"
  >
    <span>{{ formatted }}</span>
    <SaudiRiyalSymbol :class="symbolClass" />
  </span>
</template>
