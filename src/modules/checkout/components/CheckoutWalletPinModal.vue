<script setup lang="ts">
const props = defineProps<{
  open: boolean
  submitting?: boolean
  total: number
  serverError?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [pinCode: string]
}>()

const { t } = useI18n()

const PIN_MAX_LENGTH = 5

const pinCode = ref('')
const localError = ref('')
const pinReadonly = ref(true)

const displayError = computed(() => localError.value || props.serverError || '')

watch(
  () => props.open,
  (open) => {
    if (!open) return
    pinCode.value = ''
    localError.value = ''
    pinReadonly.value = true
  },
)

watch(pinCode, () => {
  localError.value = ''
})

function close() {
  if (props.submitting) return
  emit('update:open', false)
}

function onPinFocus(event: FocusEvent) {
  pinReadonly.value = false
  const input = event.target as HTMLInputElement
  input.removeAttribute('readonly')
}

function onSubmit() {
  const value = pinCode.value.trim()
  if (!value) {
    localError.value = t('site.commerce.checkout.walletPin.validation')
    return
  }

  if (value.length > PIN_MAX_LENGTH) {
    localError.value = t('site.commerce.checkout.walletPin.maxLength', { max: PIN_MAX_LENGTH })
    return
  }

  localError.value = ''
  emit('submit', value)
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="t('site.commerce.checkout.walletPin.title')"
    size="sm"
    :closable="!submitting"
    @update:open="emit('update:open', $event)"
  >
    <div class="space-y-4">
      <p class="text-sm text-foreground-muted">
        {{ t('site.commerce.checkout.walletPin.description') }}
      </p>

      <p class="rounded-xl border border-ibbil-green/10 bg-ibbil-green/[0.04] px-4 py-3 text-sm">
        <span class="text-foreground-muted">{{ t('site.commerce.checkout.total') }}:</span>
        <MoneyAmount
          :amount="total"
          class="ms-1 font-extrabold text-ibbil-green"
          symbol-class="text-xs font-semibold text-foreground-muted"
        />
      </p>

      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-foreground">
          {{ t('site.commerce.checkout.walletPin.label') }}
          <span class="text-danger" aria-hidden="true">*</span>
        </label>
        <input
          v-model="pinCode"
          type="password"
          inputmode="numeric"
          autocomplete="off"
          name="wallet-pin-code"
          :maxlength="PIN_MAX_LENGTH"
          :readonly="pinReadonly"
          class="w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-foreground transition-colors placeholder:text-foreground-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          :class="displayError ? 'border-danger' : 'border-border'"
          :placeholder="t('site.commerce.checkout.walletPin.placeholder')"
          :disabled="submitting"
          :aria-invalid="!!displayError"
          @focus="onPinFocus"
          @keyup.enter="onSubmit"
        >
        <p v-if="displayError" class="text-xs text-danger" role="alert">
          {{ displayError }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <BaseButton
          variant="ghost"
          :disabled="submitting"
          @click="close"
        >
          {{ t('common.cancel') }}
        </BaseButton>
        <BaseButton
          class="!bg-ibbil-green !text-white hover:!bg-ibbil-green-dark"
          :loading="submitting"
          @click="onSubmit"
        >
          {{ t('site.commerce.checkout.walletPin.confirm') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
