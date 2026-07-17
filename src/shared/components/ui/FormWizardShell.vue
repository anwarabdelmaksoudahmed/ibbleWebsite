<script setup lang="ts">
import type { StepperStep } from '@shared/components/ui/BaseStepper.vue'

const props = withDefaults(
  defineProps<{
    steps: StepperStep[]
    currentStep: number
    nextLabel: string
    prevLabel?: string
    showPrev?: boolean
    loading?: boolean
    progressLabel?: string
  }>(),
  {
    showPrev: false,
    loading: false,
  },
)

const emit = defineEmits<{
  next: []
  prev: []
}>()
</script>

<template>
  <div class="mx-auto w-full max-w-4xl">
    <BaseStepper
      :steps="steps"
      :current-step="currentStep"
      :aria-label="progressLabel"
      class="mb-6 sm:mb-8"
    />

    <div class="rounded-2xl border border-ibbil-green/10 bg-white p-5 shadow-sm sm:p-8">
      <Transition name="wizard-step" mode="out-in">
        <div :key="currentStep">
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
          type="button"
          variant="brand"
          class="group min-w-36 !rounded-lg"
          :loading="loading"
          @click="emit('next')"
        >
          {{ nextLabel }}
          <DirectionalArrow animated />
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
