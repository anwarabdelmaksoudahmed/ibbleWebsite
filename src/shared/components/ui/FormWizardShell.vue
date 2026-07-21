<script setup lang="ts">
import type { StepperStep } from '@shared/components/ui/BaseStepper.vue'

withDefaults(
  defineProps<{
    steps: StepperStep[]
    currentStep: number
    nextLabel: string
    prevLabel?: string
    showPrev?: boolean
    /** Hide the primary next/submit action (steps with inline CTAs). */
    showNext?: boolean
    loading?: boolean
    progressLabel?: string
    /** Hide the forward chevron (e.g. final pay/submit step). */
    hideNextArrow?: boolean
  }>(),
  {
    showPrev: false,
    showNext: true,
    loading: false,
    hideNextArrow: false,
  },
)

const emit = defineEmits<{
  next: []
  prev: []
}>()
</script>

<template>
  <div class="mx-auto w-full" data-form-wizard>
    <BaseStepper
      :steps="steps"
      :current-step="currentStep"
      :aria-label="progressLabel"
      class="mb-6 sm:mb-8"
    />

    <div class="rounded-2xl border border-ibbil-green/10 bg-white p-5 shadow-sm sm:p-8">
      <Transition name="wizard-step" mode="out-in">
        <div :key="currentStep" data-form-wizard-step>
          <slot />
        </div>
      </Transition>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <BaseButton
          v-if="showPrev"
          type="button"
          variant="outline"
          class="min-w-32 !rounded-lg"
          :disabled="loading"
          @click="emit('prev')"
        >
          <DirectionalArrow direction="back" />
          {{ prevLabel }}
        </BaseButton>

        <BaseButton
          v-if="showNext"
          type="button"
          variant="brand"
          class="group min-w-36 !rounded-lg"
          :loading="loading"
          @click="emit('next')"
        >
          {{ nextLabel }}
          <DirectionalArrow v-if="!hideNextArrow" animated />
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wizard-step-enter-active,
.wizard-step-leave-active {
  transition:
    opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

.wizard-step-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.wizard-step-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .wizard-step-enter-active,
  .wizard-step-leave-active {
    transition: none;
  }

  .wizard-step-enter-from,
  .wizard-step-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
