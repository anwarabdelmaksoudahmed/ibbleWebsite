<script setup lang="ts">
export type BasePaginationProps = {
  page: number
  totalPages: number
  disabled?: boolean
}

const props = withDefaults(defineProps<BasePaginationProps>(), {
  disabled: false,
})

const emit = defineEmits<{ 'update:page': [page: number] }>()

const pages = computed(() => {
  const result: (number | 'ellipsis')[] = []
  const { page, totalPages } = props

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  result.push(1)
  if (page > 3) result.push('ellipsis')

  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
    result.push(i)
  }

  if (page < totalPages - 2) result.push('ellipsis')
  result.push(totalPages)

  return result
})

function goTo(p: number) {
  if (!props.disabled && p >= 1 && p <= props.totalPages) {
    emit('update:page', p)
  }
}
</script>

<template>
  <nav aria-label="Pagination" class="flex items-center gap-1">
    <BaseButton variant="ghost" size="sm" :disabled="disabled || page <= 1" @click="goTo(page - 1)">
      <DirectionalArrow direction="back" variant="chevron" />
    </BaseButton>
    <template v-for="(p, i) in pages" :key="i">
      <span v-if="p === 'ellipsis'" class="px-2 text-foreground-muted">...</span>
      <BaseButton
        v-else
        :variant="p === page ? 'primary' : 'ghost'"
        size="sm"
        :disabled="disabled"
        :aria-current="p === page ? 'page' : undefined"
        @click="goTo(p)"
      >
        {{ p }}
      </BaseButton>
    </template>
    <BaseButton variant="ghost" size="sm" :disabled="disabled || page >= totalPages" @click="goTo(page + 1)">
      <DirectionalArrow variant="chevron" />
    </BaseButton>
  </nav>
</template>
