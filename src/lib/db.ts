import { Student, SessionHistory, AppSettings } from '../types';

const DB_NAME = 'lembra_personal_db';
const DB_VERSION = 1;

const STORES = {
  STUDENTS: 'students',
  HISTORY: 'history',
  REMINDERS_LOG: 'reminders_log',
  SETTINGS: 'settings',
};

// Realistic seed data strictly respecting guidelines (no medical diagnosis, professional observational records)
export const INITIAL_SEED_STUDENTS: Student[] = [
  {
    id: 'stud-1',
    name: 'José Silva',
    nickname: 'Zé',
    phone: '(11) 98765-4321',
    generalNotes: 'Aluno focado em hipertrofia e fortalecimento funcional. Treina regularmente há 6 meses.',
    startDate: '2026-02-10',
    status: 'active',
    schedules: [
      { id: 'sch-1-1', dayOfWeek: 1, time: '19:00' }, // Segunda
      { id: 'sch-1-2', dayOfWeek: 3, time: '19:00' }, // Quarta
      { id: 'sch-1-3', dayOfWeek: 4, time: '19:00' }, // Quinta (Hoje)
      { id: 'sch-1-4', dayOfWeek: 5, time: '18:00' }, // Sexta
    ],
    attentionPoints: [
      {
        id: 'pt-1-1',
        category: 'articulations',
        title: 'Joelho direito',
        condition: 'Histórico de dor e desconforto relatado pelo aluno durante exercícios com maior flexão de joelho.',
        location: 'Face anterior do joelho direito',
        whenHappens: 'Em amplitudes profundas de agachamento e leg press acima de 90° ou com velocidade excêntrica rápida',
        relatedMovements: ['Agachamento', 'Leg Press', 'Avanço'],
        whatToRemember: 'Atenção à tolerância durante exercícios envolvendo flexão de joelho. Cadência controlada na fase excêntrica.',
        notes: 'Informação registrada pelo profissional. Aluno aquece bem na bicicleta 5 min antes.',
        severity: 'warning'
      },
      {
        id: 'pt-1-2',
        category: 'restrictions',
        title: 'Amplitude em Agachamento',
        condition: 'Restrição auto-relatada de amplitude no agachamento livre com carga alta.',
        location: 'Cadeia posterior e joelho',
        whenHappens: 'Cargas acima de 80kg',
        relatedMovements: ['Agachamento Livre', 'Hack Machine'],
        whatToRemember: 'Manter amplitude segura em até 90 graus até reavaliar resposta de mobilidade.',
        notes: 'Priorizar boa mecânica de quadril.',
        severity: 'attention'
      }
    ],
    movements: [
      {
        id: 'mov-1-1',
        exercise: 'Agachamento',
        movement: 'Flexão de joelhos e quadril',
        amplitude: 'Até 90° (paralelo)',
        load: 'Progressão gradual com foco em cadência',
        position: 'Base ligeiramente mais aberta, pés levemente abduzidos',
        notes: 'Atenção à tolerância na amplitude profunda. Observar se há compensação no valgo.'
      },
      {
        id: 'mov-1-2',
        exercise: 'Leg Press 45°',
        movement: 'Empurrar plataforma',
        amplitude: 'Sem bloquear os joelhos na extensão total',
        load: 'Moderada',
        position: 'Pés na parte superior da plataforma para enfatizar glúteo/posterior',
        notes: 'Observar resposta do joelho durante a execução e não deixar a lombar descolar do banco.'
      }
    ],
    reminderSettings: {
      leadTimes: [10, 30],
      enabled: true
    },
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-08-20T14:30:00Z'
  },
  {
    id: 'stud-2',
    name: 'Maria Santos',
    nickname: 'Mari',
    phone: '(11) 97654-3210',
    generalNotes: 'Aluna muito dedicada. Busca melhora postural e condicionamento geral.',
    startDate: '2026-03-01',
    status: 'active',
    schedules: [
      { id: 'sch-2-1', dayOfWeek: 1, time: '07:00' },
      { id: 'sch-2-2', dayOfWeek: 3, time: '07:00' },
      { id: 'sch-2-3', dayOfWeek: 4, time: '07:00' }, // Quinta (Hoje)
      { id: 'sch-2-4', dayOfWeek: 5, time: '07:00' },
    ],
    attentionPoints: [
      {
        id: 'pt-2-1',
        category: 'articulations',
        title: 'Ombro direito (Manguito)',
        condition: 'Desconforto informado ao realizar abdução acima de 90 graus com carga.',
        location: 'Ombro direito / região anterior',
        whenHappens: 'Elevação lateral alta e desenvolvimento com halteres se pegada for muito aberta',
        relatedMovements: ['Desenvolvimento', 'Elevação Lateral', 'Supino Inclinado'],
        whatToRemember: 'Priorizar plano escapular (30° anterior) e pegada neutra em empurradas verticais.',
        notes: 'Fazer ativação prévia de rotadores externos com elástico.',
        severity: 'warning'
      }
    ],
    movements: [
      {
        id: 'mov-2-1',
        exercise: 'Desenvolvimento de Ombros',
        movement: 'Empurrar vertical',
        amplitude: 'Até a linha da orelha, sem descer excessivamente',
        load: 'Moderada / Halteres',
        position: 'Pegada neutra (palmas voltadas para dentro)',
        notes: 'Evitar pegada pronada aberta para não pinçar a articulação.'
      }
    ],
    reminderSettings: {
      leadTimes: [10, 15],
      enabled: true
    },
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-08-15T11:00:00Z'
  },
  {
    id: 'stud-3',
    name: 'João Pedro Costa',
    nickname: 'JP',
    phone: '(11) 96543-2109',
    generalNotes: 'Trabalha sentado o dia todo em escritório. Foco em fortalecimento de core e estabilidade.',
    startDate: '2026-04-15',
    status: 'active',
    schedules: [
      { id: 'sch-3-1', dayOfWeek: 2, time: '10:30' },
      { id: 'sch-3-2', dayOfWeek: 4, time: '10:30' }, // Quinta (Hoje)
      { id: 'sch-3-3', dayOfWeek: 6, time: '09:00' },
    ],
    attentionPoints: [
      {
        id: 'pt-3-1',
        category: 'pain',
        title: 'Coluna Lombar',
        condition: 'Relato de sensibilidade lombar após dias com muitas horas sentado.',
        location: 'Região lombar / paravertebrais',
        whenHappens: 'Exercícios com compressão axial pesada sem apoio',
        relatedMovements: ['Levantamento Terra', 'Stiff', 'Remada Curvada'],
        whatToRemember: 'Garantir ativação de bracing abdominal e apoio torácico em remadas quando necessário.',
        notes: 'Informação registrada pelo profissional. Preferir remada cavalinho com apoio ou cabo.',
        severity: 'attention'
      }
    ],
    movements: [
      {
        id: 'mov-3-1',
        exercise: 'Stiff com Halteres',
        movement: 'Flexão de quadril',
        amplitude: 'Até a linha do joelho / canela mantendo coluna neutra',
        load: 'Leve a moderada',
        position: 'Joelhos semiflexionados',
        notes: 'Interromper descida caso perceba qualquer arredondamento da lombar.'
      }
    ],
    reminderSettings: {
      leadTimes: [10, 30],
      enabled: true
    },
    createdAt: '2026-04-15T09:00:00Z',
    updatedAt: '2026-08-25T16:00:00Z'
  },
  {
    id: 'stud-4',
    name: 'Ana Paula Rocha',
    nickname: 'Aninha',
    phone: '(11) 95432-1098',
    generalNotes: 'Excelente capacidade cardiorrespiratória e flexibilidade. Nenhuma queixa relatada.',
    startDate: '2026-05-10',
    status: 'active',
    schedules: [
      { id: 'sch-4-1', dayOfWeek: 1, time: '18:00' },
      { id: 'sch-4-2', dayOfWeek: 4, time: '20:30' }, // Quinta (Hoje)
      { id: 'sch-4-3', dayOfWeek: 5, time: '17:00' },
    ],
    attentionPoints: [],
    movements: [],
    reminderSettings: {
      leadTimes: [10],
      enabled: true
    },
    createdAt: '2026-05-10T14:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z'
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  trainerName: 'Felipe Dias',
  notificationsEnabled: true,
  defaultLeadTimes: [10, 30],
  soundEnabled: true,
  vibrationEnabled: true,
  installedAt: new Date().toISOString()
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.STUDENTS)) {
        const studentStore = db.createObjectStore(STORES.STUDENTS, { keyPath: 'id' });
        studentStore.createIndex('status', 'status', { unique: false });
        studentStore.createIndex('name', 'name', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.HISTORY)) {
        const historyStore = db.createObjectStore(STORES.HISTORY, { keyPath: 'id' });
        historyStore.createIndex('studentId', 'studentId', { unique: false });
        historyStore.createIndex('scheduledDate', 'scheduledDate', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.REMINDERS_LOG)) {
        db.createObjectStore(STORES.REMINDERS_LOG, { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Ensure database has initial data if empty
export async function initializeDatabase(): Promise<void> {
  const students = await getAllStudents();
  if (students.length === 0) {
    for (const student of INITIAL_SEED_STUDENTS) {
      await saveStudent(student);
    }
  }

  const settings = await getSettings();
  if (!settings) {
    await saveSettings(INITIAL_SETTINGS);
  }
}

// Student CRUD
export async function getAllStudents(): Promise<Student[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.STUDENTS, 'readonly');
    const store = tx.objectStore(STORES.STUDENTS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.STUDENTS, 'readonly');
    const store = tx.objectStore(STORES.STUDENTS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveStudent(student: Student): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.STUDENTS, 'readwrite');
    const store = tx.objectStore(STORES.STUDENTS);
    const request = store.put(student);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteStudent(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.STUDENTS, 'readwrite');
    const store = tx.objectStore(STORES.STUDENTS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// History CRUD
export async function getHistory(): Promise<SessionHistory[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.HISTORY, 'readonly');
    const store = tx.objectStore(STORES.HISTORY);
    const request = store.getAll();

    request.onsuccess = () => {
      const records = (request.result || []) as SessionHistory[];
      // Sort newest first
      records.sort((a, b) => new Date(b.reviewedAt || b.scheduledDate).getTime() - new Date(a.reviewedAt || a.scheduledDate).getTime());
      resolve(records);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function logSessionReview(historyEntry: SessionHistory): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.HISTORY, 'readwrite');
    const store = tx.objectStore(STORES.HISTORY);
    const request = store.put(historyEntry);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Reminder deduplication log
export async function isReminderLogged(key: string): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.REMINDERS_LOG, 'readonly');
    const store = tx.objectStore(STORES.REMINDERS_LOG);
    const request = store.get(key);

    request.onsuccess = () => resolve(!!request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function logReminder(key: string, data: Record<string, unknown> = {}): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.REMINDERS_LOG, 'readwrite');
    const store = tx.objectStore(STORES.REMINDERS_LOG);
    const request = store.put({ key, timestamp: Date.now(), ...data });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// App Settings
export async function getSettings(): Promise<AppSettings | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SETTINGS, 'readonly');
    const store = tx.objectStore(STORES.SETTINGS);
    const request = store.get('app_config');

    request.onsuccess = () => resolve(request.result?.data || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SETTINGS, 'readwrite');
    const store = tx.objectStore(STORES.SETTINGS);
    const request = store.put({ id: 'app_config', data: settings });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Backup Export & Import
export async function exportAllData(): Promise<string> {
  const students = await getAllStudents();
  const history = await getHistory();
  const settings = await getSettings();

  const payload = {
    appName: 'Lembra Personal',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    students,
    history,
    settings: settings || INITIAL_SETTINGS,
  };

  return JSON.stringify(payload, null, 2);
}

export async function importAllData(jsonString: string): Promise<{ success: boolean; studentCount: number; error?: string }> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.students || !Array.isArray(data.students)) {
      return { success: false, studentCount: 0, error: 'Arquivo inválido: formato de dados não reconhecido.' };
    }

    const db = await openDB();
    const tx = db.transaction([STORES.STUDENTS, STORES.HISTORY, STORES.SETTINGS], 'readwrite');
    
    // Clear and restore students
    const studentStore = tx.objectStore(STORES.STUDENTS);
    studentStore.clear();
    for (const student of data.students) {
      studentStore.put(student);
    }

    // Restore history if present
    if (Array.isArray(data.history)) {
      const historyStore = tx.objectStore(STORES.HISTORY);
      historyStore.clear();
      for (const entry of data.history) {
        historyStore.put(entry);
      }
    }

    // Restore settings if present
    if (data.settings) {
      const settingsStore = tx.objectStore(STORES.SETTINGS);
      settingsStore.put({ id: 'app_config', data: data.settings });
    }

    return { success: true, studentCount: data.students.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao processar arquivo JSON';
    return { success: false, studentCount: 0, error: msg };
  }
}

// Reset data to default seed
export async function resetToDefaultSeed(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([STORES.STUDENTS, STORES.HISTORY, STORES.REMINDERS_LOG, STORES.SETTINGS], 'readwrite');
  
  tx.objectStore(STORES.STUDENTS).clear();
  tx.objectStore(STORES.HISTORY).clear();
  tx.objectStore(STORES.REMINDERS_LOG).clear();
  
  for (const student of INITIAL_SEED_STUDENTS) {
    tx.objectStore(STORES.STUDENTS).put(student);
  }
  
  tx.objectStore(STORES.SETTINGS).put({ id: 'app_config', data: INITIAL_SETTINGS });
}
