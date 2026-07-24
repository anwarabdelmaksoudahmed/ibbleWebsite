export type FirebasePublicConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId?: string
  vapidKey: string
}

export function readFirebasePublicConfig(
  runtimeConfig: ReturnType<typeof useRuntimeConfig>['public'],
): FirebasePublicConfig | null {
  const apiKey = String(runtimeConfig.firebaseApiKey || '').trim()
  const authDomain = String(runtimeConfig.firebaseAuthDomain || '').trim()
  const projectId = String(runtimeConfig.firebaseProjectId || '').trim()
  const storageBucket = String(runtimeConfig.firebaseStorageBucket || '').trim()
  const messagingSenderId = String(runtimeConfig.firebaseMessagingSenderId || '').trim()
  const appId = String(runtimeConfig.firebaseAppId || '').trim()
  const measurementId = String(runtimeConfig.firebaseMeasurementId || '').trim()
  const vapidKey = String(runtimeConfig.firebaseVapidKey || '').trim()

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId ||
    !vapidKey
  ) {
    return null
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId: measurementId || undefined,
    vapidKey,
  }
}
