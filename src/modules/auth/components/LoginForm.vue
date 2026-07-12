<script setup lang="ts">
import { phoneLoginSchema } from '@shared/schemas/auth.schema'
import { ROUTES } from '@shared/constants/routes'
import { useAuth } from '@modules/auth/composables/useAuth'
import { isAuthError } from '@modules/auth/utils/errors'
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE, type CountryCodeOption } from '@modules/auth/constants/country-codes'

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const toast = useToast()
const { login, isLoading } = useAuth()

const form = reactive({
  phone: '',
  countryCode: DEFAULT_COUNTRY_CODE.apiCode,
  password: '',
  remember: false,
})

const showPassword = ref(false)
const fieldErrors = reactive<Record<string, string>>({})
const formError = ref('')

const selectedCountry = computed((): CountryCodeOption => {
  return COUNTRY_CODES.find((country) => country.apiCode === form.countryCode) ?? DEFAULT_COUNTRY_CODE
})

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

  const validation = phoneLoginSchema.safeParse(form)
  if (!validation.success) {
    applyValidationErrors(validation.error.issues)
    return
  }

  try {
    await login({
      phone: form.phone,
      password: form.password,
      countryCode: form.countryCode,
      remember: form.remember,
    })

    toast.success(t('auth.loginSuccess'))

    const redirect =
      typeof route.query.redirect === 'string' ? route.query.redirect : localePath(ROUTES.HOME)
    await navigateTo(redirect)
  } catch (error) {
    if (isAuthError(error)) {
      formError.value = error.message
      if (error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, messages]) => {
          fieldErrors[field] = messages[0] ?? error.message
        })
      }
      return
    }

    formError.value = t('errors.generic')
  }
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-[0_24px_60px_-28px_rgba(45,83,61,0.4)]">
    <div class="border-b border-border/50 px-6 py-6 sm:px-8">
      <h2 class="text-xl font-bold text-ibbil-green">{{ t('auth.welcomeBack') }}</h2>
      <p class="mt-1 text-sm text-foreground-muted">{{ t('auth.loginSubtitle') }}</p>
    </div>

    <form class="space-y-5 px-6 py-6 sm:px-8 sm:py-7" @submit.prevent="handleSubmit">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div
          v-if="formError"
          class="rounded-xl border border-danger/25 bg-danger/5 px-3.5 py-2.5 text-sm text-danger"
          role="alert"
        >
          {{ formError }}
        </div>
      </Transition>

      <div class="space-y-1.5">
        <label for="login-phone" class="block text-sm font-semibold text-ibbil-green">
          {{ t('auth.mobile') }}
        </label>
        <div
          class="flex overflow-hidden rounded-xl border bg-[#fafbfa] transition-all focus-within:border-ibbil-green focus-within:bg-white focus-within:ring-2 focus-within:ring-ibbil-green/15"
          :class="fieldErrors.phone ? 'border-danger' : 'border-border'"
        >
          <div class="flex items-center border-e border-border bg-[#f3f5f3] px-2.5">
            <select
              v-model="form.countryCode"
              class="max-w-[7.5rem] bg-transparent py-3 text-sm font-medium text-foreground outline-none"
              :aria-label="t('auth.countryCode')"
            >
              <option v-for="country in COUNTRY_CODES" :key="country.apiCode" :value="country.apiCode">
                {{ country.flag }} {{ country.dialCode }}
              </option>
            </select>
          </div>
          <input
            id="login-phone"
            v-model="form.phone"
            type="tel"
            inputmode="numeric"
            autocomplete="tel-national"
            :placeholder="t('auth.phonePlaceholder')"
            class="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-foreground-muted"
            :aria-invalid="!!fieldErrors.phone"
          >
        </div>
        <p v-if="fieldErrors.phone" class="text-xs text-danger">{{ fieldErrors.phone }}</p>
        <p v-else class="text-xs text-foreground-muted">{{ selectedCountry.flag }} {{ selectedCountry.dialCode }}</p>
      </div>

      <div class="space-y-1.5">
        <label for="login-password" class="block text-sm font-semibold text-ibbil-green">
          {{ t('auth.secretPassword') }}
        </label>
        <div
          class="relative overflow-hidden rounded-xl border bg-[#fafbfa] transition-all focus-within:border-ibbil-green focus-within:bg-white focus-within:ring-2 focus-within:ring-ibbil-green/15"
          :class="fieldErrors.password ? 'border-danger' : 'border-border'"
        >
          <input
            id="login-password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            :placeholder="t('auth.passwordPlaceholder')"
            class="w-full bg-transparent px-3.5 py-3 pe-11 text-sm text-foreground outline-none placeholder:text-foreground-muted"
            :aria-invalid="!!fieldErrors.password"
          >
          <button
            type="button"
            class="absolute top-1/2 -translate-y-1/2 rounded-md p-1 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-ibbil-green end-2.5"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-4 w-4" />
          </button>
        </div>
        <p v-if="fieldErrors.password" class="text-xs text-danger">{{ fieldErrors.password }}</p>
      </div>

      <div class="flex items-center justify-between gap-3">
        <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground-muted">
          <input
            v-model="form.remember"
            type="checkbox"
            class="size-4 rounded border-border text-ibbil-green focus:ring-ibbil-green"
          >
          {{ t('auth.rememberMe') }}
        </label>
        <NuxtLinkLocale
          :to="ROUTES.AUTH.FORGOT_PASSWORD"
          class="text-sm font-semibold text-ibbil-gold transition-colors hover:text-ibbil-gold-hover"
        >
          {{ t('auth.forgotPassword') }}
        </NuxtLinkLocale>
      </div>

      <button
        type="submit"
        class="w-full rounded-xl bg-ibbil-green px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-ibbil-green/20 transition-all hover:bg-ibbil-green-dark hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="inline-flex items-center gap-2">
          <Icon name="lucide:loader-2" class="h-4 w-4 animate-spin" />
          {{ t('common.loading') }}
        </span>
        <span v-else>{{ t('auth.login') }}</span>
      </button>

      <p class="text-center text-sm text-foreground-muted">
        {{ t('auth.noAccount') }}
        <NuxtLinkLocale
          :to="ROUTES.AUTH.REGISTER"
          class="font-semibold text-ibbil-green underline-offset-4 transition-colors hover:text-ibbil-green-dark hover:underline"
        >
          {{ t('auth.register') }}
        </NuxtLinkLocale>
      </p>
    </form>
  </div>
</template>
