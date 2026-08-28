// Notifications Manager for PWA
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
    return result;
  } catch (err) {
    console.error('Erro ao solicitar permissão de notificação:', err);
    return 'denied';
  }
}

// Gentle audio alert using Web Audio API (deterministic, zero external assets required)
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
    // Audio autoplay restrictions may silently ignore, perfectly fine
  }
}

export interface TriggerNotificationParams {
  title: string;
  body: string;
  studentId?: string;
  tag?: string;
  minutesBefore?: number;
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

  const options: NotificationOptions = {
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
    // Prefer Service Worker registration if available for best PWA background reliability
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
