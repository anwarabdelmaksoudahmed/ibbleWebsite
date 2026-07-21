<script setup lang="ts">
import { PAYMENT_CALLBACK_MESSAGE_TYPE } from '@shared/payment/constants/providers'
import { getPaymentService } from '@shared/payment/services/payment.service'
import type { PaymentResult } from '@shared/payment/types/internal.types'
import { createFailureResult } from '@shared/payment/utils/mappers'
import {
  clearPendingPayment,
  loadPendingPayment,
  savePaymentOutcome,
} from '@shared/payment/utils/pending-payment'

definePageMeta({
  layout: false,
})

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const phase = ref<'loading' | 'verifying' | 'redirecting'>('loading')
const errorMessage = ref<string | null>(null)

onMounted(() => {
  if (!import.meta.client) return
  void handleCallback()
})

async function handleCallback() {
  const resourcePath = normalizeQueryValue(
    route.query.resourcePath
      ?? route.query.resource_path
      ?? route.query.resourcepath,
  )
  const checkoutId = normalizeQueryValue(
    route.query.id
      ?? route.query.checkoutId
      ?? route.query.checkout_id,
  )

  if (window.parent !== window) {
    window.parent.postMessage(
      {
        type: PAYMENT_CALLBACK_MESSAGE_TYPE,
        resourcePath,
        checkoutId,
      },
      window.location.origin,
    )
    return
  }

  if (window.opener) {
    window.opener.postMessage(
      {
        type: PAYMENT_CALLBACK_MESSAGE_TYPE,
        resourcePath,
        checkoutId,
      },
      window.location.origin,
    )
    window.close()
    return
  }

  await handleStandaloneCallback(resourcePath, checkoutId)
}

async function handleStandaloneCallback(
  resourcePath: string | undefined,
  checkoutId: string | undefined,
) {
  phase.value = 'verifying'

  const pending = loadPendingPayment()
  if (!pending) {
    errorMessage.value = t('payment.callback.missingSession')
    phase.value = 'redirecting'
    await navigateTo(localePath('/'))
    return
  }

  const service = getPaymentService()
  let result: PaymentResult

  try {
    result = await service.handleCallback(pending.session, {
      resourcePath,
      checkoutId: checkoutId ?? pending.session.checkoutId,
    })
  } catch {
    result = createFailureResult(
      pending.session.orderId,
      pending.session.transactionId,
      t('payment.callback.verificationFailed'),
    )
  }

  savePaymentOutcome({
    result,
    request: pending.request,
    cartSnapshot: pending.cartSnapshot,
  })
  clearPendingPayment()

  phase.value = 'redirecting'
  await navigateTo(pending.returnPath)
}

function normalizeQueryValue(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-surface p-6">
    <div class="text-center">
      <BaseLoader block show-label />
      <p class="mt-3 text-sm text-foreground-muted">
        {{
          phase === 'redirecting'
            ? t('payment.callback.redirecting')
            : t('payment.callback.verifying')
        }}
      </p>
      <p
        v-if="errorMessage"
        class="mt-2 text-sm text-red-600 dark:text-red-400"
      >
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>
