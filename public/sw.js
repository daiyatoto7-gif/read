self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

self.addEventListener('push', e => {
  const data = e.data?.json() ?? {}
  e.waitUntil(
    self.registration.showNotification(data.title ?? 'BookLog', {
      body: data.body ?? '読書を記録しましょう📚',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url ?? '/' },
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(
    self.clients.openWindow(e.notification.data?.url ?? '/')
  )
})

// 定期的なリマインダーチェック（毎時間）
self.addEventListener('periodicsync', e => {
  if (e.tag === 'reading-reminder') {
    e.waitUntil(checkAndNotify())
  }
})

async function checkAndNotify() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const hour = now.getHours()
  const minutes = now.getMinutes()

  // キャッシュから設定を取得
  const cache = await caches.open('booklog-settings')
  const settingsRes = await cache.match('/sw-settings')
  if (!settingsRes) return

  const settings = await settingsRes.json()
  if (!settings.enabled) return

  const [settingHour, settingMinutes] = settings.time.split(':').map(Number)
  if (dayOfWeek === settings.day && hour === settingHour && Math.abs(minutes - settingMinutes) < 5) {
    await self.registration.showNotification('BookLog リマインダー', {
      body: '今週の読書を記録しましょう📚',
      icon: '/icon-192.png',
      data: { url: '/' },
    })
  }
}
