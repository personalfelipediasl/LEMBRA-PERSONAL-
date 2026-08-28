// Service Worker for Lembra Personal PWA
// Handles Offline Caching, Background Sync, Scheduled Reminders & Web Push Notifications

const CACHE_NAME = 'lembra-personal-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// 1. Install & Cache Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('SW cache addAll non-critical error:', err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate & Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Strategy: Network First for HTML, Cache First for Static Assets
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html') || caches.match(event.request))
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});

// 4. Handle Notification Clicks (Focus or Open App)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if (event.notification.data?.studentId && 'navigate' in client) {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// 5. Handle Web Push Events (Incoming from Web Push server / PushManager)
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || '🔔 Lembra Personal — Lembrete de Treino';
  const options = {
    body: data.body || 'Você tem um atendimento agendado em breve. Abra para revisar os cuidados.',
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || `push-${Date.now()}`,
    data: {
      url: data.url || '/',
      studentId: data.studentId,
    },
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 6. Handle Background Sync & Periodic Sync (Wake up in background to check reminders)
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-reminders' || event.tag === 'lembra-sync') {
    event.waitUntil(checkAndTriggerBackgroundReminders());
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-reminders' || event.tag === 'lembra-sync') {
    event.waitUntil(checkAndTriggerBackgroundReminders());
  }
});

// 7. Handle Messages from Client (Scheduling reminders & delayed background triggers)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  // Pre-schedule notifications using Notification Triggers (TimestampTrigger) or active alarms
  if (event.data.type === 'SCHEDULE_REMINDERS') {
    event.waitUntil(scheduleRemindersInWorker(event.data.reminders || []));
  } else if (event.data.type === 'CHECK_REMINDERS_NOW') {
    event.waitUntil(checkAndTriggerBackgroundReminders());
  } else if (event.data.type === 'SCHEDULE_DELAYED_TEST') {
    const delayMs = event.data.delayMs || 5000;
    const title = event.data.title || '🔔 TESTE EM SEGUNDO PLANO — LEMBRA PERSONAL';
    const body = event.data.body || 'Notificação entregue com sucesso enquanto o app estava em segundo plano!';
    
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        vibrate: [200, 100, 200],
        tag: `delayed-test-${Date.now()}`,
        requireInteraction: true,
        data: { url: '/' }
      });
    }, delayMs);
  }
});

// Helper: Open IndexedDB inside Service Worker
function openLocalDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in self)) {
      return reject(new Error('IndexedDB not supported in Service Worker'));
    }
    const request = indexedDB.open('lembra_personal_db', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Helper: Pre-schedule reminders via TimestampTrigger (Chromium / Android OS level alarm)
async function scheduleRemindersInWorker(reminders) {
  if (!Array.isArray(reminders)) return;

  for (const rem of reminders) {
    if (!rem.timestamp || rem.timestamp <= Date.now()) continue;

    const options = {
      body: rem.body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: rem.tag || `rem-${rem.studentId}-${rem.timestamp}`,
      data: {
        url: '/',
        studentId: rem.studentId,
      },
      requireInteraction: true,
    };

    // If Notification Triggers API is supported by the browser, register it in the OS alarm manager
    if ('showTrigger' in Notification.prototype && typeof TimestampTrigger !== 'undefined') {
      try {
        // @ts-ignore
        options.showTrigger = new TimestampTrigger(rem.timestamp);
        await self.registration.showNotification(rem.title, options);
      } catch (e) {
        console.warn('TimestampTrigger not available, falling back:', e);
      }
    }
  }
}

// Helper: Independent background verification by reading IndexedDB directly
async function checkAndTriggerBackgroundReminders() {
  try {
    const db = await openLocalDB();
    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Read students
    const students = await new Promise((resolve) => {
      const tx = db.transaction('students', 'readonly');
      const store = tx.objectStore('students');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    for (const student of students) {
      if (student.status !== 'active') continue;

      const matchingSchedules = (student.schedules || []).filter((s) => s.dayOfWeek === currentDay);
      for (const sch of matchingSchedules) {
        const [h, m] = sch.time.split(':').map(Number);
        const schMinutes = (h || 0) * 60 + (m || 0);
        const minutesRemaining = schMinutes - currentMinutes;

        const leadTimes = student.reminderSettings?.leadTimes || [10, 30];
        for (const leadTime of leadTimes) {
          if (minutesRemaining <= leadTime && minutesRemaining >= leadTime - 3) {
            const deduplicationKey = `${student.id}_${sch.id}_${todayStr}_${leadTime}min`;

            // Check if already logged
            const alreadyLogged = await new Promise((resolve) => {
              const tx = db.transaction('reminders_log', 'readonly');
              const store = tx.objectStore('reminders_log');
              const req = store.get(deduplicationKey);
              req.onsuccess = () => resolve(!!req.result);
              req.onerror = () => resolve(false);
            });

            if (!alreadyLogged) {
              // Log into reminders_log
              await new Promise((resolve) => {
                const tx = db.transaction('reminders_log', 'readwrite');
                const store = tx.objectStore('reminders_log');
                store.put({ key: deduplicationKey, timestamp: Date.now() });
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => resolve(false);
              });

              // Format notification text
              const pointsCount = (student.attentionPoints || []).length;
              let title = `🔔 ATENDIMENTO EM ${leadTime} MINUTOS`;
              let body = `Seu aluno ${student.name} chega às ${sch.time}.`;

              if (pointsCount === 0) {
                body += '\nNenhum ponto crítico registrado. Bom treino!';
              } else if (pointsCount === 1) {
                const pt = student.attentionPoints[0];
                body += `\nPonto de atenção: ${pt.title}.\nRevise os cuidados antes de começar.`;
              } else {
                title = `🔔 PRÓXIMO ALUNO`;
                body = `${student.name} chega em ${leadTime} min (${pointsCount} pontos de atenção). Abra para revisar.`;
              }

              await self.registration.showNotification(title, {
                body,
                icon: '/icon.svg',
                badge: '/icon.svg',
                vibrate: [200, 100, 200, 100, 200],
                tag: deduplicationKey,
                data: {
                  url: '/',
                  studentId: student.id,
                },
                requireInteraction: true,
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Background check reminders error in SW:', err);
  }
}
