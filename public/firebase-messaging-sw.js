/* eslint-disable no-undef */
/**
 * Firebase Cloud Messaging service worker.
 * Keep config in sync with NUXT_PUBLIC_FIREBASE_* env values.
 */
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyBcnLvmdAtxDNtzB5vYUGDajTSkSelz68w',
  authDomain: 'ibbil-2f368.firebaseapp.com',
  projectId: 'ibbil-2f368',
  storageBucket: 'ibbil-2f368.firebasestorage.app',
  messagingSenderId: '63224202655',
  appId: '1:63224202655:web:e7e951c1f9e85e1502e9aa',
  measurementId: 'G-BBP854SG63',
})

const messaging = firebase.messaging()

function broadcastTransportPush(data) {
  return self.clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then((windowClients) => {
      for (const client of windowClients) {
        client.postMessage({
          type: 'IBBLE_TRANSPORT_PUSH',
          data: data || {},
        })
      }
    })
}

messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] background message', payload)
  const data = payload.data || {}
  const title = payload.notification?.title || data.title || 'Ibbil Transport'
  const body =
    payload.notification?.body || data.body || data.message || ''

  // Notify any open waiting-room tabs immediately.
  void broadcastTransportPush(data)

  self.registration.showNotification(title, {
    body,
    data,
    icon: '/favicon.svg',
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const data = event.notification.data || {}
  const tripRequestId =
    data.tripRequestId || data.trip_request_id || data.requestId || data.request_id
  const offerId = data.offerId || data.offer_id || data.offerID
  const target = tripRequestId
    ? `/transport/requests/${tripRequestId}`
    : '/profile/transportation'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          client.postMessage({
            type: 'IBBLE_TRANSPORT_PUSH',
            data: {
              ...data,
              ...(offerId ? { offerId: String(offerId) } : {}),
              ...(tripRequestId ? { tripRequestId: String(tripRequestId) } : {}),
            },
          })
          if ('focus' in client) {
            return client.focus().then((focused) => {
              if (focused && 'navigate' in focused && typeof focused.navigate === 'function') {
                return focused.navigate(target)
              }
              return focused
            })
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(target)
      }),
  )
})
