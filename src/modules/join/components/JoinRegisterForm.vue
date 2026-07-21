<script setup lang="ts">
import type { JoinOptionCardItem } from '@modules/join/components/JoinOptionCards.vue'
import {
  JOIN_PROVIDER_TYPE_ICONS,
  JOIN_SERVICES,
  JOIN_SERVICE_ICONS,
} from '@modules/join/constants'
import { useJoinForm } from '@modules/join/composables/useJoinForm'
import { useJoinLookups } from '@modules/join/composables/useJoinLookups'
import { findCountryByApiCode } from '@shared/constants/country-codes'
import { ROUTES } from '@shared/constants/routes'

const { t } = useI18n()

const {
  service,
  providerType,
  providerTypes,
  commissionRate,
  form,
  fieldErrors,
  formError,
  submitting,
  submitted,
  selectService,
  selectProviderType,
  setNationalId,
  validateField,
  handleSubmit,
  reset,
} = useJoinForm()

const isMerchant = computed(() => providerType.value === 'merchant')

const { storeTypes, cities, isStoreTypesLoading, isCitiesLoading } = useJoinLookups(isMerchant)

const serviceOptions = computed<JoinOptionCardItem[]>(() =>
  JOIN_SERVICES.map((value) => ({
    value,
    label: t(`join.services.${value}.title`),
    description: t(`join.services.${value}.description`),
    icon: JOIN_SERVICE_ICONS[value],
  })),
)

const providerTypeOptions = computed<JoinOptionCardItem[]>(() =>
  providerTypes.value
    .filter((type) => type !== 'merchant')
    .map((type) => ({
      value: type,
      label: t(`join.providerTypes.${type}`),
      icon: JOIN_PROVIDER_TYPE_ICONS[type],
    })),
)

const selectedCountry = computed(() => findCountryByApiCode(form.countryCode))

const showsCommission = computed(() => commissionRate.value !== null)

const commissionLabel = computed(() => {
  if (commissionRate.value === null) return ''
  const key = service.value === 'veterinary' ? 'join.form.commissionBooking' : 'join.form.commissionOrder'
  return t(key, { rate: commissionRate.value })
})

const submitLabel = computed(() =>
  service.value === 'veterinary' ? t('join.form.next') : t('join.form.submit'),
)
</script>

<template>
  <div class="mx-auto w-full max-w-2xl">
    <Transition
      mode="out-in"
      enter-active-class="transition duration-250 ease-out"
      enter-from-class="opacity-0 translate-y-3"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <JoinSuccessCard v-if="submitted" @reset="reset" />

      <div
        v-else
        class="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-[0_24px_60px_-28px_rgba(45,83,61,0.4)]"
      >
        <div class="border-b border-border/50 px-4 py-5 sm:px-8 sm:py-6">
          <h2 class="text-lg font-bold text-ibbil-green sm:text-xl">{{ t('join.title') }}</h2>
          <p class="mt-1 text-sm text-foreground-muted">{{ t('join.subtitle') }}</p>
        </div>

        <form
          class="space-y-6 px-4 py-6 sm:px-8 sm:py-7"
          data-join-form
          novalidate
          @submit.prevent="handleSubmit"
        >
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div
              v-if="formError"
              class="rounded-xl border border-danger/25 bg-danger/5 px-3.5 py-2.5 text-sm text-danger"
              role="alert"
              data-validation-error
              tabindex="-1"
            >
              {{ formError }}
            </div>
          </Transition>

          <JoinOptionCards
            :label="t('join.form.chooseService')"
            :options="serviceOptions"
            :model-value="service"
            required
            @update:model-value="selectService($event as typeof JOIN_SERVICES[number])"
          />

          <!-- Animated height: switching service/type shrinks & grows smoothly
               instead of jumping, so the layout never jolts. -->
          <BaseAnimatedHeight>
            <div class="space-y-6">
              <Transition
                enter-active-class="transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                enter-from-class="opacity-0 translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <JoinOptionCards
                  v-if="providerTypeOptions.length"
                  :label="t('join.form.chooseProviderType')"
                  :options="providerTypeOptions"
                  :model-value="providerType"
                  required
                  @update:model-value="selectProviderType($event as NonNullable<typeof providerType>)"
                />
              </Transition>

              <Transition
                mode="out-in"
                enter-active-class="transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                enter-from-class="opacity-0 translate-y-3"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0 -translate-y-1"
              >
                <div v-if="providerType" :key="providerType" class="space-y-6">
                  <!-- ═══════════ متجر / تاجر ═══════════ -->
                  <template v-if="providerType === 'merchant'">
                    <section class="space-y-4">
                      <div class="flex items-center gap-2">
                        <span class="flex size-6 items-center justify-center rounded-md bg-ibbil-green/10 text-ibbil-green">
                          <Icon name="lucide:user-round" class="size-3.5" />
                        </span>
                        <h3 class="text-sm font-bold text-ibbil-green">{{ t('join.form.sections.storeOwner') }}</h3>
                      </div>

                      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <BaseInput
                          id="join-owner-name"
                          v-model="form.ownerName"
                          :label="t('join.form.fullName')"
                          :placeholder="t('join.form.fullNamePlaceholder')"
                          :error="fieldErrors.ownerName"
                          autocomplete="name"
                          maxlength="50"
                          required
                          @blur="validateField('ownerName')"
                        />

                        <BasePhoneInput
                          id="join-phone"
                          v-model:phone="form.phone"
                          v-model:country-code="form.countryCode"
                          :label="t('join.form.mobile')"
                          :placeholder="selectedCountry.example"
                          :error="fieldErrors.phone"
                          :country-error="fieldErrors.countryCode"
                          required
                          @blur="validateField('phone')"
                        />

                        <BaseInput
                          id="join-national-id"
                          :model-value="form.nationalId"
                          :label="t('join.form.nationalId')"
                          placeholder="2123456789"
                          :error="fieldErrors.nationalId"
                          inputmode="numeric"
                          autocomplete="off"
                          maxlength="14"
                          required
                          root-class="sm:col-span-2"
                          @update:model-value="setNationalId($event)"
                          @blur="validateField('nationalId')"
                        />
                      </div>
                    </section>

                    <section class="space-y-4 border-t border-border/60 pt-5">
                      <div class="flex items-center gap-2">
                        <span class="flex size-6 items-center justify-center rounded-md bg-ibbil-gold/15 text-ibbil-gold">
                          <Icon name="lucide:store" class="size-3.5" />
                        </span>
                        <h3 class="text-sm font-bold text-ibbil-green">{{ t('join.form.sections.storeData') }}</h3>
                      </div>

                      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <BaseSelect
                          id="join-store-type"
                          v-model="form.storeTypeId"
                          :label="t('join.form.storeType')"
                          :placeholder="t('join.form.storeTypePlaceholder')"
                          :options="storeTypes"
                          :loading="isStoreTypesLoading"
                          :error="fieldErrors.storeTypeId"
                          required
                          root-class="sm:col-span-2"
                          @update:model-value="validateField('storeTypeId')"
                        />

                        <BaseInput
                          id="join-store-name-ar"
                          v-model="form.storeNameAr"
                          :label="t('join.form.storeNameAr')"
                          :placeholder="t('join.form.placeholders.storeNameAr')"
                          :error="fieldErrors.storeNameAr"
                          maxlength="100"
                          required
                          @blur="validateField('storeNameAr')"
                        />

                        <BaseInput
                          id="join-store-name-en"
                          v-model="form.storeNameEn"
                          :label="t('join.form.storeNameEn')"
                          :placeholder="t('join.form.placeholders.storeNameEn')"
                          :error="fieldErrors.storeNameEn"
                          dir="ltr"
                          maxlength="100"
                          required
                          @blur="validateField('storeNameEn')"
                        />

                        <BaseSelect
                          id="join-city"
                          v-model="form.cityId"
                          :label="t('join.form.city')"
                          :placeholder="t('join.form.cityPlaceholder')"
                          :options="cities"
                          :loading="isCitiesLoading"
                          :error="fieldErrors.cityId"
                          searchable
                          required
                          @update:model-value="validateField('cityId')"
                        />

                        <BaseInput
                          id="join-store-address"
                          v-model="form.address"
                          :label="t('join.form.storeAddress')"
                          :placeholder="t('join.form.placeholders.address')"
                          :error="fieldErrors.address"
                          autocomplete="street-address"
                          maxlength="255"
                          required
                          @blur="validateField('address')"
                        />
                      </div>
                    </section>
                  </template>

                  <!-- ═══════════ سائق مستقل ═══════════ -->
                  <template v-else-if="providerType === 'driver'">
                    <div class="grid grid-cols-1 gap-4">
                      <BaseInput
                        id="join-driver-name"
                        v-model="form.fullName"
                        :label="t('join.form.fullName')"
                        :placeholder="t('join.form.fullNamePlaceholder')"
                        :error="fieldErrors.fullName"
                        autocomplete="name"
                        maxlength="50"
                        required
                        @blur="validateField('fullName')"
                      />

                      <BasePhoneInput
                        id="join-driver-phone"
                        v-model:phone="form.phone"
                        v-model:country-code="form.countryCode"
                        :label="t('join.form.phone')"
                        :placeholder="selectedCountry.example"
                        :error="fieldErrors.phone"
                        :country-error="fieldErrors.countryCode"
                        required
                        @blur="validateField('phone')"
                      />

                      <BaseInput
                        id="join-driver-national-id"
                        :model-value="form.nationalId"
                        :label="t('join.form.nationalId')"
                        placeholder="2123456789"
                        :error="fieldErrors.nationalId"
                        inputmode="numeric"
                        autocomplete="off"
                        maxlength="14"
                        required
                        @update:model-value="setNationalId($event)"
                        @blur="validateField('nationalId')"
                      />
                    </div>
                  </template>

                  <!-- ═══════════ شركة شحن ═══════════ -->
                  <template v-else-if="providerType === 'company'">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <BaseInput
                        id="join-company-name"
                        v-model="form.companyName"
                        :label="t('join.form.companyName')"
                        :placeholder="t('join.form.placeholders.companyName')"
                        :error="fieldErrors.companyName"
                        autocomplete="organization"
                        maxlength="100"
                        required
                        @blur="validateField('companyName')"
                      />

                      <BaseInput
                        id="join-company-address"
                        v-model="form.companyAddress"
                        :label="t('join.form.companyAddress')"
                        :placeholder="t('join.form.placeholders.address')"
                        :error="fieldErrors.companyAddress"
                        autocomplete="street-address"
                        maxlength="255"
                        required
                        @blur="validateField('companyAddress')"
                      />

                      <BaseInput
                        id="join-company-owner"
                        v-model="form.ownerName"
                        :label="t('join.form.companyOwnerName')"
                        :placeholder="t('join.form.fullNamePlaceholder')"
                        :error="fieldErrors.ownerName"
                        autocomplete="name"
                        maxlength="50"
                        required
                        root-class="sm:col-span-2"
                        @blur="validateField('ownerName')"
                      />

                      <BasePhoneInput
                        id="join-company-phone"
                        v-model:phone="form.phone"
                        v-model:country-code="form.countryCode"
                        :label="t('join.form.phone')"
                        :placeholder="selectedCountry.example"
                        :error="fieldErrors.phone"
                        :country-error="fieldErrors.countryCode"
                        required
                        @blur="validateField('phone')"
                      />

                      <BaseInput
                        id="join-company-national-id"
                        :model-value="form.nationalId"
                        :label="t('join.form.nationalId')"
                        placeholder="2123456789"
                        :error="fieldErrors.nationalId"
                        inputmode="numeric"
                        autocomplete="off"
                        maxlength="14"
                        required
                        @update:model-value="setNationalId($event)"
                        @blur="validateField('nationalId')"
                      />
                    </div>
                  </template>

                  <!-- ═══════════ دكتور مستقل / عيادة ═══════════ -->
                  <template v-else>
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <BaseInput
                        v-if="providerType === 'clinic'"
                        id="join-clinic-name"
                        v-model="form.clinicName"
                        :label="t('join.form.clinicName')"
                        :placeholder="t('join.form.placeholders.clinicName')"
                        :error="fieldErrors.clinicName"
                        autocomplete="organization"
                        maxlength="100"
                        required
                        @blur="validateField('clinicName')"
                      />

                      <BaseInput
                        v-if="providerType === 'clinic'"
                        id="join-clinic-owner"
                        v-model="form.ownerName"
                        :label="t('join.form.clinicOwnerName')"
                        :placeholder="t('join.form.fullNamePlaceholder')"
                        :error="fieldErrors.ownerName"
                        autocomplete="name"
                        maxlength="50"
                        required
                        @blur="validateField('ownerName')"
                      />

                      <BaseInput
                        v-if="providerType === 'doctor'"
                        id="join-doctor-name"
                        v-model="form.fullName"
                        :label="t('join.form.fullName')"
                        :placeholder="t('join.form.fullNamePlaceholder')"
                        :error="fieldErrors.fullName"
                        autocomplete="name"
                        maxlength="50"
                        required
                        root-class="sm:col-span-2"
                        @blur="validateField('fullName')"
                      />

                      <BaseInput
                        id="join-vet-email"
                        v-model="form.email"
                        :label="t('join.form.email')"
                        placeholder="example@gmail.com"
                        :error="fieldErrors.email"
                        type="email"
                        inputmode="email"
                        autocomplete="email"
                        required
                        root-class="sm:col-span-2"
                        @blur="validateField('email')"
                      />

                      <BasePhoneInput
                        id="join-vet-phone"
                        v-model:phone="form.phone"
                        v-model:country-code="form.countryCode"
                        :label="t('join.form.mobile')"
                        :placeholder="selectedCountry.example"
                        :error="fieldErrors.phone"
                        :country-error="fieldErrors.countryCode"
                        required
                        @blur="validateField('phone')"
                      />

                      <BasePhoneInput
                        id="join-vet-other-phone"
                        v-model:phone="form.otherPhone"
                        v-model:country-code="form.countryCode"
                    :label="t('join.form.otherPhone')"
                    :error="fieldErrors.otherPhone"
                        @blur="validateField('otherPhone')"
                      />

                      <BaseInput
                        id="join-vet-national-id"
                        :model-value="form.nationalId"
                        :label="t('join.form.nationalId')"
                        placeholder="2123456789"
                        :error="fieldErrors.nationalId"
                        inputmode="numeric"
                        autocomplete="off"
                        maxlength="14"
                        required
                        root-class="sm:col-span-2"
                        @update:model-value="setNationalId($event)"
                        @blur="validateField('nationalId')"
                      />
                    </div>
                  </template>

                  <BaseCheckbox
                    v-if="showsCommission"
                    id="join-terms"
                    v-model="form.termsAccepted"
                    :label="commissionLabel"
                    :error="fieldErrors.termsAccepted"
                    @update:model-value="validateField('termsAccepted')"
                  />

                  <BaseButton type="submit" variant="brand" block :loading="submitting">
                    <template v-if="!submitting">
                      {{ submitLabel }}
                    </template>
                    <template v-else>
                      {{ t('common.loading') }}
                    </template>
                  </BaseButton>
                </div>
              </Transition>
            </div>
          </BaseAnimatedHeight>

          <p class="text-center text-sm text-foreground-muted mt-4">
            {{ t('join.form.hasAccount') }}
            <NuxtLinkLocale
              :to="ROUTES.AUTH.LOGIN"
              class="font-semibold text-ibbil-green underline-offset-4 hover:underline"
            >
              {{ t('auth.login') }}
            </NuxtLinkLocale>
          </p>
        </form>
      </div>
    </Transition>
  </div>
</template>
