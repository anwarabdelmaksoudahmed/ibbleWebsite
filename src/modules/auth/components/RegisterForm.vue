<script setup lang="ts">
import { phoneRegisterSchema } from '@shared/schemas/auth.schema'
import { ROUTES } from '@shared/constants/routes'
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from '@modules/auth/constants/country-codes'

const { t } = useI18n()
const toast = useToast()

const form = reactive({
  name: '',
  phone: '',
  countryCode: DEFAULT_COUNTRY_CODE.apiCode,
  password: '',
  confirmPassword: '',
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)
const fieldErrors = reactive<Record<string, string>>({})
const formError = ref('')

function clearErrors() {
  formError.value = ''
  Object.keys(fieldErrors).forEach((key) => {
    delete fieldErrors[key]
  })
}

function applyValidationErrors(issues: { path: PropertyKey[]; message: string }[]) {
  issues.forEach((issue) => {
    const field = String(issue.path[0] ?? '')
    if (field) fieldErrors[field] = issue.message
  })
}

async function handleSubmit() {
  clearErrors()

  const validation = phoneRegisterSchema.safeParse(form)
  if (!validation.success) {
    applyValidationErrors(validation.error.issues)
    return
  }

  isSubmitting.value = true
  try {
    // Registration API is not available yet — keep UI ready for future endpoint.
    await new Promise((resolve) => setTimeout(resolve, 600))
    toast.info(t('auth.registerComingSoon'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-[0_24px_60px_-28px_rgba(45,83,61,0.4)]">
    <div class="border-b border-border/50 px-6 py-6 sm:px-8">
      <h2 class="text-xl font-bold text-ibbil-green">{{ t('auth.createAccount') }}</h2>
      <p class="mt-1 text-sm text-foreground-muted">{{ t('auth.registerSubtitle') }}</p>
    </div>

    <form class="space-y-4 px-6 py-6 sm:px-8 sm:py-7" @submit.prevent="handleSubmit">
      <div
        v-if="formError"
        class="rounded-xl border border-danger/25 bg-danger/5 px-3.5 py-2.5 text-sm text-danger"
        role="alert"
      >
        {{ formError }}
      </div>

      <div class="space-y-1.5">
        <label for="register-name" class="block text-sm font-semibold text-ibbil-green">
          {{ t('auth.fullName') }}
        </label>
        <input
          id="register-name"
          v-model="form.name"
          type="text"
          autocomplete="name"
          :placeholder="t('auth.fullNamePlaceholder')"
          class="w-full rounded-xl border bg-[#fafbfa] px-3.5 py-3 text-sm outline-none transition-all placeholder:text-foreground-muted focus:border-ibbil-green focus:bg-white focus:ring-2 focus:ring-ibbil-green/15"
          :class="fieldErrors.name ? 'border-danger' : 'border-border'"
        >
        <p v-if="fieldErrors.name" class="text-xs text-danger">{{ fieldErrors.name }}</p>
      </div>

      <div class="space-y-1.5">
        <label for="register-phone" class="block text-sm font-semibold text-ibbil-green">
          {{ t('auth.mobile') }}
        </label>
        <div
          class="flex overflow-hidden rounded-xl border bg-[#fafbfa] transition-all focus-within:border-ibbil-green focus-within:bg-white focus-within:ring-2 focus-within:ring-ibbil-green/15"
          :class="fieldErrors.phone ? 'border-danger' : 'border-border'"
        >
          <div class="flex items-center border-e border-border bg-[#f3f5f3] px-2.5">
            <select
              v-model="form.countryCode"
              class="max-w-[7.5rem] bg-transparent py-3 text-sm font-medium outline-none"
              :aria-label="t('auth.countryCode')"
            >
              <option v-for="country in COUNTRY_CODES" :key="country.apiCode" :value="country.apiCode">
                {{ country.flag }} {{ country.dialCode }}
              </option>
            </select>
          </div>
          <input
            id="register-phone"
            v-model="form.phone"
            type="tel"
            inputmode="numeric"
            autocomplete="tel-national"
            :placeholder="t('auth.phonePlaceholder')"
            class="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-sm outline-none placeholder:text-foreground-muted"
          >
        </div>
        <p v-if="fieldErrors.phone" class="text-xs text-danger">{{ fieldErrors.phone }}</p>
      </div>

      <div class="space-y-1.5">
        <label for="register-password" class="block text-sm font-semibold text-ibbil-green">
          {{ t('auth.secretPassword') }}
        </label>
        <div
          class="relative overflow-hidden rounded-xl border bg-[#fafbfa] transition-all focus-within:border-ibbil-green focus-within:bg-white focus-within:ring-2 focus-within:ring-ibbil-green/15"
          :class="fieldErrors.password ? 'border-danger' : 'border-border'"
        >
          <input
            id="register-password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            :placeholder="t('auth.passwordPlaceholder')"
            class="w-full bg-transparent px-3.5 py-3 pe-11 text-sm outline-none placeholder:text-foreground-muted"
          >
          <button
            type="button"
            class="absolute top-1/2 -translate-y-1/2 rounded-md p-1 text-foreground-muted hover:text-ibbil-green end-2.5"
            @click="showPassword = !showPassword"
          >
            <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-4 w-4" />
          </button>
        </div>
        <p v-if="fieldErrors.password" class="text-xs text-danger">{{ fieldErrors.password }}</p>
      </div>

      <div class="space-y-1.5">
        <label for="register-confirm" class="block text-sm font-semibold text-ibbil-green">
          {{ t('auth.confirmPassword') }}
        </label>
        <div
          class="relative overflow-hidden rounded-xl border bg-[#fafbfa] transition-all focus-within:border-ibbil-green focus-within:bg-white focus-within:ring-2 focus-within:ring-ibbil-green/15"
          :class="fieldErrors.confirmPassword ? 'border-danger' : 'border-border'"
        >
          <input
            id="register-confirm"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            :placeholder="t('auth.confirmPasswordPlaceholder')"
            class="w-full bg-transparent px-3.5 py-3 pe-11 text-sm outline-none placeholder:text-foreground-muted"
          >
          <button
            type="button"
            class="absolute top-1/2 -translate-y-1/2 rounded-md p-1 text-foreground-muted hover:text-ibbil-green end-2.5"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <Icon :name="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-4 w-4" />
          </button>
        </div>
        <p v-if="fieldErrors.confirmPassword" class="text-xs text-danger">{{ fieldErrors.confirmPassword }}</p>
      </div>

      <button
        type="submit"
        class="mt-2 w-full rounded-xl bg-ibbil-green px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-ibbil-green/20 transition-all hover:bg-ibbil-green-dark hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting" class="inline-flex items-center gap-2">
          <Icon name="lucide:loader-2" class="h-4 w-4 animate-spin" />
          {{ t('common.loading') }}
        </span>
        <span v-else>{{ t('auth.createAccount') }}</span>
      </button>

      <p class="text-center text-sm text-foreground-muted">
        {{ t('auth.hasAccount') }}
        <NuxtLinkLocale
          :to="ROUTES.AUTH.LOGIN"
          class="font-semibold text-ibbil-green underline-offset-4 hover:underline"
        >
          {{ t('auth.login') }}
        </NuxtLinkLocale>
      </p>
    </form>
  </div>
</template>
