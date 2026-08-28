import { Student, DayOfWeek, TodayAppointment, SessionHistory } from '../types';
import { isReminderLogged, logReminder, logSessionReview } from './db';
import { sendLocalNotification } from './notifications';

export function getTodayDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentDayOfWeek(date = new Date()): DayOfWeek {
  return date.getDay() as DayOfWeek;
}

export function timeStringToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function getCurrentMinutesFromMidnight(date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function formatMinutesRemaining(minutes: number): string {
  if (minutes < 0) {
    const passed = Math.abs(minutes);
    if (passed < 60) return `Iniciou há ${passed} min`;
    const hours = Math.floor(passed / 60);
    const remMins = passed % 60;
    return `Iniciou há ${hours}h ${remMins > 0 ? `${remMins}min` : ''}`;
  }
  if (minutes === 0) return 'Agora';
  if (minutes === 1) return 'Falta 1 minuto';
  if (minutes < 60) return `Faltam ${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  const remMins = minutes % 60;
  if (remMins === 0) return `Faltam ${hours} hora${hours > 1 ? 's' : ''}`;
  return `Faltam ${hours}h ${remMins}min`;
}

// Compute appointments for a specific day of week and date
export function computeAppointmentsForDay(
  students: Student[],
  history: SessionHistory[],
  targetDate = new Date()
): TodayAppointment[] {
  const dayOfWeek = targetDate.getDay() as DayOfWeek;
  const todayStr = getTodayDateString(targetDate);
  const currentTotalMins = getCurrentMinutesFromMidnight(new Date());
  const isTargetToday = todayStr === getTodayDateString(new Date());

  const appointments: TodayAppointment[] = [];

  for (const student of students) {
    if (student.status !== 'active') continue;

    const matchingSchedules = student.schedules.filter((s) => s.dayOfWeek === dayOfWeek);

    for (const schedule of matchingSchedules) {
      const scheduleMins = timeStringToMinutes(schedule.time);
      const minutesRemaining = isTargetToday ? scheduleMins - currentTotalMins : 999;
      
      // Check if session was already reviewed today
      const reviewedEntry = history.find(
        (h) => h.studentId === student.id && h.scheduledDate === todayStr && h.scheduledTime === schedule.time && h.acknowledged
      );

      let status: TodayAppointment['status'] = 'scheduled';
      if (reviewedEntry) {
        status = 'prepared';
      } else if (isTargetToday && minutesRemaining < -60) {
        status = 'finished';
      } else if (isTargetToday && minutesRemaining <= 60 && student.attentionPoints.length > 0) {
        status = 'warning';
      }

      appointments.push({
        id: `${student.id}_${schedule.id}_${todayStr}`,
        student,
        schedule,
        time: schedule.time,
        minutesRemaining,
        isNowOrPassed: isTargetToday && minutesRemaining <= 0,
        isPreparationWindow: isTargetToday && minutesRemaining >= -10 && minutesRemaining <= 15,
        pointsCount: student.attentionPoints.length,
        status,
        lastReviewedTime: reviewedEntry?.reviewedAt,
      });
    }
  }

  // Sort chronologically by time
  appointments.sort((a, b) => timeStringToMinutes(a.time) - timeStringToMinutes(b.time));

  return appointments;
}

// Determine the next upcoming or active appointment
export function getNextAppointment(appointments: TodayAppointment[]): TodayAppointment | null {
  if (appointments.length === 0) return null;

  // First priority: appointment in progress (started within last 30 min) or upcoming
  const upcomingOrCurrent = appointments.filter((app) => app.minutesRemaining >= -30);
  if (upcomingOrCurrent.length > 0) {
    return upcomingOrCurrent[0];
  }

  // Fallback to first of the day
  return appointments[0];
}

// Deterministic reminder evaluation engine
export async function checkAndTriggerReminders(
  students: Student[],
  history: SessionHistory[],
  onReminderTriggered?: (appointment: TodayAppointment, leadTime: number, message: string) => void
): Promise<void> {
  const now = new Date();
  const todayStr = getTodayDateString(now);
  const appointments = computeAppointmentsForDay(students, history, now);

  for (const appointment of appointments) {
    const { student, schedule, minutesRemaining } = appointment;
    
    // Check if student has reminder settings
    const leadTimes = student.reminderSettings?.leadTimes?.length
      ? student.reminderSettings.leadTimes
      : [10, 30];

    for (const leadTime of leadTimes) {
      // Trigger if current minutes remaining is within [leadTime - 1, leadTime]
      if (minutesRemaining <= leadTime && minutesRemaining >= leadTime - 2) {
        const deduplicationKey = `${student.id}_${schedule.id}_${todayStr}_${leadTime}min`;
        
        const alreadyLogged = await isReminderLogged(deduplicationKey);
        if (!alreadyLogged) {
          // Format deterministic reminder text according to rules
          const pointsCount = student.attentionPoints.length;
          let title = `🔔 ATENDIMENTO EM ${leadTime} MINUTOS`;
          let body = `Seu aluno ${student.name} está chegando às ${schedule.time}.`;

          if (pointsCount === 0) {
            body += '\nNenhum ponto de atenção registrado. Bom treino!';
          } else if (pointsCount === 1) {
            const firstPt = student.attentionPoints[0];
            body += `\nPonto de atenção: ${firstPt.title.toLowerCase()}.\nRevise os cuidados antes de começar.`;
          } else {
            title = `🔔 PRÓXIMO ALUNO`;
            body = `${student.name} chega em ${leadTime} minutos.\nVocê tem ${pointsCount} pontos de atenção registrados.\nAbra para revisar a preparação.`;
          }

          // Mark logged in IndexedDB FIRST to avoid race conditions
          await logReminder(deduplicationKey, {
            studentId: student.id,
            studentName: student.name,
            scheduledTime: schedule.time,
            leadTime,
            date: todayStr
          });

          // Log in History
          const historyEntry: SessionHistory = {
            id: `rem_${Date.now()}_${student.id}`,
            studentId: student.id,
            studentName: student.name,
            scheduledTime: schedule.time,
            scheduledDate: todayStr,
            dayOfWeek: schedule.dayOfWeek,
            reminderSentAt: new Date().toISOString(),
            reminderType: `${leadTime} min antes`,
            pointsCount,
            acknowledged: false
          };
          await logSessionReview(historyEntry);

          // Dispatch native / PWA notification
          await sendLocalNotification({
            title,
            body,
            studentId: student.id,
            tag: deduplicationKey,
            minutesBefore: leadTime
          });

          if (onReminderTriggered) {
            onReminderTriggered(appointment, leadTime, body);
          }
        }
      }
    }
  }
}
