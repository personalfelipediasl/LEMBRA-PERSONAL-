// Notifications Manager for PWA
import { Student, SessionHistory } from '../types';
import { computeAppointmentsForDay, getTodayDateString, timeStringToMinutes } from './scheduler';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      await registerBackgroundSync();
    }
    return result;
  } catch (err) {
    console.error('Erro ao solicitar permissão de notificação:', err);
    return 'denied';
  }
}

// Gentle audio alert using Web Audio API
export function playNotificationSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    osc.frequency.setValueAtTime(1174.66, now + 0.2); // D6

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  } catch {
    // Audio autoplay restrictions may silently ignore
  }
}

export interface TriggerNotificationParams {
  title: string;
  body: string;
  studentId?: string;
  tag?: string;
  minutesBefore?: number;
  triggerTimestamp?: number;
}

export async function sendLocalNotification(params: TriggerNotificationParams): Promise<boolean> {
  const perm = getNotificationPermission();

  // Vibration feedback if supported
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([180, 80, 180]);
    } catch {
      // ignore
    }
  }

  playNotificationSound();

  if (perm !== 'granted') {
    return false;
  }

  const options: NotificationOptions & { showTrigger?: unknown } = {
    body: params.body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: params.tag || `lembra-${Date.now()}`,
    data: {
      url: '/',
      studentId: params.studentId,
    },
    requireInteraction: true,
  };

  try {
    // Prefer Service Worker registration for background and lock-screen reliability
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(params.title, options);
        return true;
      }
    }

    // Fallback to standard window Notification
    new Notification(params.title, options);
    return true;
  } catch (err) {
    console.warn('Fallback para notificação in-app devido a restrição do ambiente:', err);
    return false;
  }
}

// Pre-schedule upcoming reminders into the Service Worker
export async function syncRemindersWithServiceWorker(
  students: Student[],
  history: SessionHistory[]
): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.ready;
    if (!reg) return;

    const now = new Date();
    const todayAppointments = computeAppointmentsForDay(students, history, now);
    const remindersToSchedule: Array<{
      title: string;
      body: string;
      studentId: string;
      timestamp: number;
      tag: string;
    }> = [];

    const todayStr = getTodayDateString(now);

    for (const app of todayAppointments) {
      const { student, schedule } = app;
      const [h, m] = schedule.time.split(':').map(Number);
      const appDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);

      const leadTimes = student.reminderSettings?.leadTimes || [10, 30];
      for (const leadTime of leadTimes) {
        const triggerTime = new Date(appDate.getTime() - leadTime * 60 * 1000);
        
        // If trigger is in the future
        if (triggerTime.getTime() > now.getTime()) {
          const pointsCount = student.attentionPoints.length;
          let title = `🔔 ATENDIMENTO EM ${leadTime} MINUTOS`;
          let body = `Seu aluno ${student.name} chega às ${schedule.time}.`;

          if (pointsCount === 0) {
            body += '\nNenhum ponto crítico registrado. Bom treino!';
          } else if (pointsCount === 1) {
            body += `\nPonto de atenção: ${student.attentionPoints[0].title}.\nRevise os cuidados antes de começar.`;
          } else {
            title = `🔔 PRÓXIMO ALUNO`;
            body = `${student.name} chega em ${leadTime} min (${pointsCount} pontos de atenção). Abra para revisar.`;
          }

          remindersToSchedule.push({
            title,
            body,
            studentId: student.id,
            timestamp: triggerTime.getTime(),
            tag: `${student.id}_${schedule.id}_${todayStr}_${leadTime}min`,
          });
        }
      }
    }

    // Send payload to active Service Worker controller
    if (reg.active) {
      reg.active.postMessage({
        type: 'SCHEDULE_REMINDERS',
        reminders: remindersToSchedule,
      });
    }
  } catch (err) {
    console.warn('Erro ao sincronizar lembretes com Service Worker:', err);
  }
}

// Schedule a delayed test notification via Service Worker to test closed/background delivery
export async function scheduleDelayedTestNotification(seconds = 5): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    setTimeout(() => {
      sendLocalNotification({
        title: '🔔 TESTE DE SEGUNDO PLANO — LEMBRA PERSONAL',
        body: 'Notificação entregue com sucesso enquanto você testava o aplicativo!',
        tag: `test-delay-${Date.now()}`,
      });
    }, seconds * 1000);
    return true;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    if (reg && reg.active) {
      reg.active.postMessage({
        type: 'SCHEDULE_DELAYED_TEST',
        delayMs: seconds * 1000,
        title: '🔔 TESTE EM SEGUNDO PLANO — LEMBRA PERSONAL',
        body: 'O lembrete funcionou perfeitamente mesmo em segundo plano!',
      });
      return true;
    }
  } catch (err) {
    console.warn('Falha ao enviar mensagem para Service Worker:', err);
  }

  setTimeout(() => {
    sendLocalNotification({
      title: '🔔 TESTE DE SEGUNDO PLANO — LEMBRA PERSONAL',
      body: 'Notificação entregue com sucesso!',
      tag: `test-delay-${Date.now()}`,
    });
  }, seconds * 1000);

  return true;
}

// Register Periodic Background Sync if supported (Chromium / Android PWA)
export async function registerBackgroundSync(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.ready;
    
    // Check for Periodic Background Sync
    if ('periodicSync' in reg) {
      // @ts-ignore
      const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
      if (status.state === 'granted') {
        // @ts-ignore
        await reg.periodicSync.register('check-reminders', {
          minInterval: 15 * 60 * 1000, // Every 15 minutes
        });
      }
    }

    // Check for Background Sync
    if ('sync' in reg) {
      // @ts-ignore
      await reg.sync.register('check-reminders');
    }
  } catch {
    // Non-critical: not all platforms support Periodic Sync
  }
}
