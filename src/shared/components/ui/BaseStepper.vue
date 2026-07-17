<script setup lang="ts">
export type StepperStep = {
  key: string
  label: string
}

const props = defineProps<{
  steps: StepperStep[]
  currentStep: number
  ariaLabel?: string
}>()

/**
 * Enable grow transitions only after the first paint so a restored
 * `currentStep` shows filled connectors immediately (no stuck scaleX(0)).
 */
const connectorsAnimated = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    connectorsAnimated.value = true
  })
})

function stepState(index: number): 'complete' | 'current' | 'upcoming' {
  if (index < props.currentStep) return 'complete'
  if (index === props.currentStep) return 'current'
  return 'upcoming'
}

function isConnectorBeforeFilled(index: number): boolean {
  return index <= props.currentStep
}

function isConnectorAfterFilled(index: number): boolean {
  return index < props.currentStep
}
</script>

<template>
  <nav
    :aria-label="ariaLabel"
    class="stepper w-full"
    :class="{ 'stepper--animated': connectorsAnimated }"
  >
    <ol role="list" class="flex w-full items-start">
      <li
        v-for="(step, index) in steps"
        :key="step.key"
        class="stepper-item flex min-w-0 flex-1 flex-col items-center"
        :aria-current="index === currentStep ? 'step' : undefined"
      >
        <div class="flex w-full items-center">
          <div
            v-if="index > 0"
            class="stepper-connector"
            aria-hidden="true"
          >
            <span
              class="stepper-connector__fill"
              :data-filled="isConnectorBeforeFilled(index) ? 'true' : 'false'"
            />
          </div>

          <div
            class="stepper-circle relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold sm:h-10 sm:w-10"
            :data-state="stepState(index)"
          >
            <Transition name="stepper-mark" mode="out-in">
              <Icon
                v-if="stepState(index) === 'complete'"
                key="check"
                name="lucide:check"
                class="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]"
                aria-hidden="true"
              />
              <span v-else :key="`step-${index + 1}`">{{ index + 1 }}</span>
            </Transition>
          </div>

          <div
            v-if="index < steps.length - 1"
            class="stepper-connector"
            aria-hidden="true"
          >
            <span
              class="stepper-connector__fill"
              :data-filled="isConnectorAfterFilled(index) ? 'true' : 'false'"
            />
          </div>
        </div>

        <p
          class="stepper-label mt-2 max-w-[5.5rem] text-center text-xs font-semibold leading-snug sm:max-w-none sm:text-sm"
          :data-state="stepState(index)"
        >
          {{ step.label }}
        </p>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.stepper-connector {
  position: relative;
  height: 2px;
  min-width: 0.5rem;
  flex: 1 1 0%;
  overflow: hidden;
  border-radius: 9999px;
  background-color: var(--color-border-muted);
}

.stepper-connector__fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: var(--color-ibbil-green);
  transform: scaleX(0);
  transform-origin: left center;
}

:dir(rtl) .stepper-connector__fill {
  transform-origin: right center;
}

.stepper-connector__fill[data-filled='true'] {
  transform: scaleX(1);
}

.stepper--animated .stepper-connector__fill {
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.stepper-circle {
  color: white;
  background-color: var(--color-border-muted);
  transition:
    background-color 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.stepper-circle[data-state='upcoming'] {
  color: var(--color-foreground-muted);
}

.stepper-circle[data-state='current'],
.stepper-circle[data-state='complete'] {
  background-color: var(--color-ibbil-green);
  box-shadow: 0 4px 14px -6px rgba(45, 83, 61, 0.45);
}

.stepper-circle[data-state='current'] {
  animation: stepper-circle-pop 0.45s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.stepper-circle[data-state='current']::after {
  content: '';
  position: absolute;
  inset: -5px;
  border-radius: 9999px;
  border: 2px solid rgba(212, 160, 68, 0.42);
  animation: stepper-ring-pulse 1.8s ease-in-out infinite;
  pointer-events: none;
}

.stepper-label {
  color: var(--color-foreground-muted);
  transition:
    color 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.stepper-label[data-state='current'],
.stepper-label[data-state='complete'] {
  color: var(--color-ibbil-green);
}

.stepper-label[data-state='current'] {
  animation: stepper-label-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.stepper-mark-enter-active,
.stepper-mark-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.stepper-mark-enter-from,
.stepper-mark-leave-to {
  opacity: 0;
  transform: scale(0.55);
}

@keyframes stepper-circle-pop {
  0% {
    transform: scale(0.88);
  }
  65% {
    transform: scale(1.06);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes stepper-ring-pulse {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.04);
  }
}

@keyframes stepper-label-rise {
  from {
    opacity: 0.65;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stepper--animated .stepper-connector__fill {
    transition: none;
  }

  .stepper-circle,
  .stepper-label {
    transition: none;
    animation: none !important;
  }

  .stepper-circle[data-state='current']::after {
    animation: none;
    opacity: 0.7;
    transform: none;
  }

  .stepper-mark-enter-active,
  .stepper-mark-leave-active {
    transition: none;
  }

  .stepper-mark-enter-from,
  .stepper-mark-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
