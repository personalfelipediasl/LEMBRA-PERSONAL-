export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

export const DAYS_OF_WEEK_LABELS: Record<DayOfWeek, { short: string; long: string }> = {
  0: { short: 'Dom', long: 'Domingo' },
  1: { short: 'Seg', long: 'Segunda-feira' },
  2: { short: 'Ter', long: 'Terça-feira' },
  3: { short: 'Qua', long: 'Quarta-feira' },
  4: { short: 'Qui', long: 'Quinta-feira' },
  5: { short: 'Sex', long: 'Sexta-feira' },
  6: { short: 'Sáb', long: 'Sábado' },
};

export type AttentionCategory = 'articulations' | 'pain' | 'restrictions' | 'other';

export const ATTENTION_CATEGORIES: { id: AttentionCategory; label: string; icon: string; description: string }[] = [
  {
    id: 'articulations',
    label: 'Articulações',
    icon: '🦵',
    description: 'Problemas articulares relatados (joelho, ombro, coluna, etc.)'
  },
  {
    id: 'pain',
    label: 'Dores',
    icon: '⚠️',
    description: 'Dores durante movimento, pós-treino ou sensibilidade'
  },
  {
    id: 'restrictions',
    label: 'Restrições',
    icon: '🚫',
    description: 'Movimento limitado, exercício a evitar, amplitude ou carga'
  },
  {
    id: 'other',
    label: 'Outros Cuidados',
    icon: '📝',
    description: 'Condições informadas, histórico e cuidados livres'
  }
];

export interface AttentionPoint {
  id: string;
  category: AttentionCategory;
  title: string; // Ex: "Joelho direito", "Ombro esquerdo", "Lombar"
  condition: string; // "Problema / Condição relatada"
  location?: string; // "Local específico"
  whenHappens?: string; // "Quando acontece (ex: flexão profunda, carga alta)"
  relatedMovements?: string[]; // Ex: ["Agachamento", "Leg Press"]
  whatToRemember: string; // "O que devo lembrar durante o treino? (Ex: observar tolerância e ajustar)"
  notes?: string; // Observação livre registrada pelo Personal
  severity: 'attention' | 'warning' | 'high';
}

export interface AttentionMovement {
  id: string;
  exercise: string; // Ex: "Agachamento", "Leg Press", "Desenvolvimento"
  movement?: string; // Ex: "Flexão profunda de joelho"
  amplitude?: string; // Ex: "Até 90 graus"
  load?: string; // Ex: "Moderar carga"
  position?: string; // Ex: "Pés ligeiramente abduzidos"
  notes: string; // Ex: "Atenção à tolerância na amplitude profunda"
}

export interface StudentSchedule {
  id: string;
  dayOfWeek: DayOfWeek;
  time: string; // "07:00", "19:00"
}

export interface ReminderSettings {
  leadTimes: number[]; // [5, 10, 15, 30, 60] minutes before
  enabled: boolean;
}

export interface Student {
  id: string;
  name: string;
  nickname?: string;
  phone?: string;
  generalNotes?: string;
  startDate: string; // YYYY-MM-DD
  status: 'active' | 'inactive';
  schedules: StudentSchedule[];
  attentionPoints: AttentionPoint[];
  movements: AttentionMovement[];
  reminderSettings: ReminderSettings;
  createdAt: string;
  updatedAt: string;
}

export interface SessionHistory {
  id: string;
  studentId: string;
  studentName: string;
  scheduledTime: string; // "19:00"
  scheduledDate: string; // "2026-08-27"
  dayOfWeek: DayOfWeek;
  reviewedAt?: string; // ISO String
  reminderSentAt?: string; // ISO String
  reminderType?: string;
  pointsCount: number;
  acknowledged: boolean;
  trainerNote?: string;
}

export interface TodayAppointment {
  id: string;
  student: Student;
  schedule: StudentSchedule;
  time: string; // "19:00"
  minutesRemaining: number;
  isNowOrPassed: boolean;
  isPreparationWindow: boolean; // <= 15 minutes
  pointsCount: number;
  status: 'prepared' | 'warning' | 'scheduled' | 'finished';
  lastReviewedTime?: string;
}

export interface AppSettings {
  trainerName: string;
  notificationsEnabled: boolean;
  defaultLeadTimes: number[];
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  installedAt?: string;
}
