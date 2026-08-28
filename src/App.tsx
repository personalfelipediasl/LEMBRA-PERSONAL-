/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Student,
  SessionHistory,
  TodayAppointment,
  AppSettings,
} from './types';
import {
  initializeDatabase,
  getAllStudents,
  getHistory,
  saveStudent,
  deleteStudent,
  logSessionReview,
  getSettings,
  saveSettings,
} from './lib/db';
import {
  computeAppointmentsForDay,
  getNextAppointment,
  checkAndTriggerReminders,
  getTodayDateString,
} from './lib/scheduler';
import {
  getNotificationPermission,
  requestNotificationPermission,
  NotificationPermissionState,
  syncRemindersWithServiceWorker,
} from './lib/notifications';

// Components
import { Header } from './components/Header';
import { NextAppointmentCard } from './components/NextAppointmentCard';
import { TodayScheduleList } from './components/TodayScheduleList';
import { PreWorkoutModal } from './components/PreWorkoutModal';
import { StudentFormModal } from './components/StudentFormModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { StudentsListView } from './components/StudentsListView';
import { DayAgendaView } from './components/DayAgendaView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { OnboardingModal } from './components/OnboardingModal';
import { QuickActionMenu } from './components/QuickActionMenu';
import { BottomNavigation, NavTab } from './components/BottomNavigation';
import { InAppReminderAlert } from './components/InAppReminderAlert';

export default function App() {
  // App state
  const [students, setStudents] = useState<Student[]>([]);
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermissionState>('default');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isLoading, setIsLoading] = useState(true);

  // Modals and Active Views
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [activePreparationAppointment, setActivePreparationAppointment] = useState<TodayAppointment | null>(null);
  const [studentFormState, setStudentFormState] = useState<{
    isOpen: boolean;
    student?: Student | null;
    initialStep?: number;
  }>({ isOpen: false, student: null, initialStep: 1 });
  const [showOnboarding, setShowOnboarding] = useState(false);

  // In-app Alert Toaster
  const [inAppAlert, setInAppAlert] = useState<{
    appointment: TodayAppointment;
    leadTime: number;
    message: string;
  } | null>(null);

  // PWA Install Prompt state
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // 1. Initial Load & Database Setup
  const refreshData = useCallback(async () => {
    try {
      await initializeDatabase();
      const [allStudents, allHistory, appSettings] = await Promise.all([
        getAllStudents(),
        getHistory(),
        getSettings(),
      ]);

      setStudents(allStudents);
      setHistory(allHistory);
      setSettings(appSettings);

      // Check if onboarding was previously dismissed
      const hasSeenOnboarding = localStorage.getItem('lembra_personal_onboarding');
      if (!hasSeenOnboarding && allStudents.length <= 4) {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do banco local:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    setNotificationStatus(getNotificationPermission());

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [refreshData]);

  // 2. Real-time Clock & Reminder Evaluation Loop
  useEffect(() => {
    if (students.length > 0) {
      syncRemindersWithServiceWorker(students, history);
    }

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Evaluate reminders
      if (students.length > 0) {
        checkAndTriggerReminders(students, history, (app, leadTime, msg) => {
          setInAppAlert({
            appointment: app,
            leadTime,
            message: msg,
          });
        });
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(timer);
  }, [students, history]);

  // Visibility change listener (re-check reminders when user unlocks phone / brings PWA to foreground)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && students.length > 0) {
        setCurrentTime(new Date());
        syncRemindersWithServiceWorker(students, history);
        checkAndTriggerReminders(students, history, (app, leadTime, msg) => {
          setInAppAlert({
            appointment: app,
            leadTime,
            message: msg,
          });
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [students, history]);

  // 3. Computed Today's Appointments & Next Appointment
  const todayAppointments = useMemo(() => {
    return computeAppointmentsForDay(students, history, currentTime);
  }, [students, history, currentTime]);

  const nextAppointment = useMemo(() => {
    return getNextAppointment(todayAppointments);
  }, [todayAppointments]);

  // Handlers
  const handleRequestNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotificationStatus(perm);
  };

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleConfirmReview = async (appointment: TodayAppointment) => {
    const historyEntry: SessionHistory = {
      id: `rev_${Date.now()}_${appointment.student.id}`,
      studentId: appointment.student.id,
      studentName: appointment.student.name,
      scheduledTime: appointment.schedule.time,
      scheduledDate: getTodayDateString(new Date()),
      dayOfWeek: appointment.schedule.dayOfWeek,
      reviewedAt: new Date().toISOString(),
      pointsCount: appointment.pointsCount,
      acknowledged: true,
    };

    await logSessionReview(historyEntry);
    setHistory((prev) => [historyEntry, ...prev]);
  };

  const handleSaveStudent = async (studentToSave: Student) => {
    await saveStudent(studentToSave);
    setStudents((prev) => {
      const idx = prev.findIndex((s) => s.id === studentToSave.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = studentToSave;
        return updated;
      }
      return [studentToSave, ...prev];
    });

    if (selectedStudentForProfile?.id === studentToSave.id) {
      setSelectedStudentForProfile(studentToSave);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    await deleteStudent(studentId);
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setSelectedStudentForProfile(null);
  };

  const handleToggleStatus = async (student: Student) => {
    const updated: Student = {
      ...student,
      status: student.status === 'active' ? 'inactive' : 'active',
      updatedAt: new Date().toISOString(),
    };
    await handleSaveStudent(updated);
  };

  const handleOpenPreparationDirectly = (student: Student) => {
    const dummyApp: TodayAppointment = {
      id: `sim_${student.id}`,
      student,
      schedule: student.schedules[0] || { id: 's1', dayOfWeek: 1, time: '19:00' },
      time: student.schedules[0]?.time || '19:00',
      minutesRemaining: 10,
      isNowOrPassed: false,
      isPreparationWindow: true,
      pointsCount: student.attentionPoints.length,
      status: 'warning',
    };
    setActivePreparationAppointment(dummyApp);
  };

  const handleCloseOnboarding = () => {
    localStorage.setItem('lembra_personal_onboarding', 'true');
    setShowOnboarding(false);
  };

  const handleStartWithNewStudent = () => {
    handleCloseOnboarding();
    setStudentFormState({ isOpen: true, student: null, initialStep: 1 });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans flex flex-col justify-between selection:bg-orange-500 selection:text-black">
      {/* Fixed Sticky Header */}
      <Header
        notificationStatus={notificationStatus}
        onRequestNotifications={handleRequestNotifications}
        currentTime={currentTime}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 sm:px-5">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest font-mono">
              Carregando sua memória operacional...
            </p>
          </div>
        ) : (
          <>
            {/* TAB 1: INÍCIO (Home) */}
            {activeTab === 'home' && (
              <div className="space-y-6 pb-24 animate-in fade-in duration-200">
                {/* 1. Next Appointment / Preparation Ritual Card */}
                <NextAppointmentCard
                  appointment={nextAppointment}
                  onOpenPreparation={(app) => setActivePreparationAppointment(app)}
                  onViewStudent={(id) => {
                    const st = students.find((s) => s.id === id);
                    if (st) setSelectedStudentForProfile(st);
                  }}
                />

                {/* 2. Today's Appointments List */}
                <TodayScheduleList
                  appointments={todayAppointments}
                  onOpenPreparation={(app) => setActivePreparationAppointment(app)}
                  onViewStudent={(id) => {
                    const st = students.find((s) => s.id === id);
                    if (st) setSelectedStudentForProfile(st);
                  }}
                  onAddNewStudent={() => setStudentFormState({ isOpen: true, student: null, initialStep: 1 })}
                />

                {/* 3. Professional Liability Notice & Discreet Developer Credit */}
                <div className="pt-4 border-t border-zinc-900 text-center space-y-2">
                  <p className="text-[10px] text-zinc-500 max-w-xs mx-auto leading-relaxed">
                    Este aplicativo é uma ferramenta de organização e lembrete profissional. Não substitui avaliação clínica médica.
                  </p>
                  <p className="text-[11px] font-semibold text-zinc-400">
                    Desenvolvido por Felipe Dias
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: ALUNOS */}
            {activeTab === 'students' && (
              <div className="animate-in fade-in duration-200">
                <StudentsListView
                  students={students}
                  onSelectStudent={(st) => setSelectedStudentForProfile(st)}
                  onAddNewStudent={() => setStudentFormState({ isOpen: true, student: null, initialStep: 1 })}
                  onOpenPreparationDirectly={handleOpenPreparationDirectly}
                />
              </div>
            )}

            {/* TAB 3: AGENDA (Meu Dia) */}
            {activeTab === 'agenda' && (
              <div className="animate-in fade-in duration-200">
                <DayAgendaView
                  students={students}
                  history={history}
                  onOpenPreparation={(app) => setActivePreparationAppointment(app)}
                  onViewStudent={(id) => {
                    const st = students.find((s) => s.id === id);
                    if (st) setSelectedStudentForProfile(st);
                  }}
                />
              </div>
            )}

            {/* TAB 4: HISTÓRICO */}
            {activeTab === 'history' && (
              <div className="animate-in fade-in duration-200">
                <HistoryView
                  history={history}
                  onViewStudent={(id) => {
                    const st = students.find((s) => s.id === id);
                    if (st) setSelectedStudentForProfile(st);
                  }}
                />
              </div>
            )}

            {/* TAB 5: CONFIGURAÇÕES / AJUSTES */}
            {activeTab === 'settings' && (
              <div className="animate-in fade-in duration-200">
                <SettingsView
                  notificationStatus={notificationStatus}
                  onRefreshNotifications={() => setNotificationStatus(getNotificationPermission())}
                  onDataChanged={refreshData}
                  installPrompt={installPrompt}
                  onInstallApp={handleInstallApp}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Quick Action Button (+) */}
      {activeTab !== 'settings' && (
        <QuickActionMenu
          onNewStudent={() => setStudentFormState({ isOpen: true, student: null, initialStep: 1 })}
          onNewSchedule={() => setStudentFormState({ isOpen: true, student: null, initialStep: 2 })}
          onNewAttentionPoint={() => setStudentFormState({ isOpen: true, student: null, initialStep: 3 })}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* In-App Live Reminder Alert Banner */}
      <InAppReminderAlert
        alert={inAppAlert}
        onOpenPreparation={(app) => setActivePreparationAppointment(app)}
        onDismiss={() => setInAppAlert(null)}
      />

      {/* PREPARATION MODAL ("ANTES DO TREINO") */}
      {activePreparationAppointment && (
        <PreWorkoutModal
          appointment={activePreparationAppointment}
          onClose={() => setActivePreparationAppointment(null)}
          onConfirmReview={handleConfirmReview}
          onViewStudentProfile={(id) => {
            const st = students.find((s) => s.id === id);
            if (st) setSelectedStudentForProfile(st);
          }}
        />
      )}

      {/* STUDENT REGISTRATION / EDIT WIZARD */}
      {studentFormState.isOpen && (
        <StudentFormModal
          initialStudent={studentFormState.student}
          initialStep={studentFormState.initialStep || 1}
          onClose={() => setStudentFormState({ isOpen: false, student: null, initialStep: 1 })}
          onSave={handleSaveStudent}
        />
      )}

      {/* STUDENT FULL PROFILE MODAL */}
      {selectedStudentForProfile && (
        <StudentProfileModal
          student={selectedStudentForProfile}
          onClose={() => setSelectedStudentForProfile(null)}
          onEdit={(st) => setStudentFormState({ isOpen: true, student: st, initialStep: 1 })}
          onDelete={handleDeleteStudent}
          onToggleStatus={handleToggleStatus}
          onOpenPreparationDirectly={handleOpenPreparationDirectly}
        />
      )}

      {/* FIRST-TIME WELCOME ONBOARDING */}
      {showOnboarding && (
        <OnboardingModal
          onStart={handleCloseOnboarding}
          onAddNewStudent={handleStartWithNewStudent}
        />
      )}
    </div>
  );
}
