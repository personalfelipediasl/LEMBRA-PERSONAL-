import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, Sparkles, User } from 'lucide-react';
import { Student, DayOfWeek, DAYS_OF_WEEK_LABELS, TodayAppointment, SessionHistory } from '../types';
import { computeAppointmentsForDay, getTodayDateString } from '../lib/scheduler';

interface DayAgendaViewProps {
  students: Student[];
  history: SessionHistory[];
  onOpenPreparation: (appointment: TodayAppointment) => void;
  onViewStudent: (studentId: string) => void;
}

export const DayAgendaView: React.FC<DayAgendaViewProps> = ({
  students,
  history,
  onOpenPreparation,
  onViewStudent,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const dayOfWeek = selectedDate.getDay() as DayOfWeek;
  const isToday = getTodayDateString(selectedDate) === getTodayDateString(new Date());

  const appointments = computeAppointmentsForDay(students, history, selectedDate);

  const shiftDate = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  const formattedDateHeader = selectedDate.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  }).toUpperCase();

  const dayNameLong = DAYS_OF_WEEK_LABELS[dayOfWeek].long;

  return (
    <div className="space-y-4 pb-20">
      {/* Header & Date Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-white font-heading tracking-tight">
            MEU DIA
          </h2>
          <p className="text-xs text-zinc-400">
            {dayNameLong} • {appointments.length} {appointments.length === 1 ? 'atendimento' : 'atendimentos'}
          </p>
        </div>

        {/* Quick Day Navigator */}
        <div className="flex items-center gap-1 bg-[#121215] border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => shiftDate(-1)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(new Date())}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
              isToday
                ? 'bg-orange-500 text-black font-extrabold'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            {isToday ? 'Hoje' : formattedDateHeader}
          </button>

          <button
            onClick={() => shiftDate(1)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Quick Strip */}
      <div className="grid grid-cols-7 gap-1">
        {([1, 2, 3, 4, 5, 6, 0] as DayOfWeek[]).map((d) => {
          const isCurrentSelected = dayOfWeek === d;
          return (
            <button
              key={d}
              onClick={() => {
                const currentD = selectedDate.getDay();
                const diff = (d - currentD + 7) % 7;
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() + (diff === 0 && !isCurrentSelected ? 7 : diff));
                setSelectedDate(newDate);
              }}
              className={`py-2 px-1 rounded-xl text-center transition-all ${
                isCurrentSelected
                  ? 'bg-orange-500 text-black font-extrabold shadow-md shadow-orange-500/20'
                  : 'bg-[#121215] text-zinc-400 border border-zinc-800 hover:border-zinc-700 font-semibold'
              }`}
            >
              <span className="text-[10px] uppercase block">{DAYS_OF_WEEK_LABELS[d].short}</span>
            </button>
          );
        })}
      </div>

      {/* Day Title Banner */}
      <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-xs">
        <span className="font-bold text-white uppercase tracking-wider font-mono">
          {isToday ? 'HOJE' : dayNameLong.toUpperCase()} — {formattedDateHeader}
        </span>
        <span className="text-orange-400 font-semibold">
          Ordem cronológica
        </span>
      </div>

      {/* Timeline List */}
      {appointments.length === 0 ? (
        <div className="rounded-2xl bg-[#121215] border border-zinc-800 p-8 text-center space-y-2">
          <Calendar className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-sm font-bold text-white">Nenhum atendimento programado</p>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Não há alunos cadastrados para este dia da semana ({dayNameLong}).
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {appointments.map((app) => {
            const { student, time, pointsCount, status } = app;
            const isPrepared = status === 'prepared';
            const hasCritical = pointsCount >= 2;
            const hasModerate = pointsCount === 1;

            return (
              <div
                key={app.id}
                onClick={() => onOpenPreparation(app)}
                className={`group rounded-2xl p-4 border transition-all duration-200 cursor-pointer shadow-sm ${
                  isPrepared
                    ? 'bg-[#101311] border-emerald-500/30 hover:border-emerald-500/60'
                    : hasCritical
                    ? 'bg-[#161210] border-orange-500/50 hover:border-orange-500 orange-glow-sm'
                    : hasModerate
                    ? 'bg-[#141210] border-orange-500/30 hover:border-orange-500/60'
                    : 'bg-[#121215] border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Time + Student Details */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 flex-shrink-0 text-center">
                      <span className="text-xs font-mono font-extrabold text-orange-400 block">
                        {time}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-extrabold text-white truncate group-hover:text-orange-400 transition-colors">
                          {student.name}
                        </h3>
                        {student.nickname && (
                          <span className="text-xs text-zinc-400">
                            ({student.nickname})
                          </span>
                        )}
                      </div>

                      {/* Status Tag Prescribed in Section 12 */}
                      <div className="mt-1 flex items-center gap-2">
                        {isPrepared ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            ✓ Preparado
                          </span>
                        ) : pointsCount === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            🟢 Sem pontos críticos
                          </span>
                        ) : hasCritical ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-orange-400 bg-orange-500/15 border border-orange-500/40 px-2 py-0.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            🔴 Revisar antes do atendimento
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            🟠 {pointsCount} ponto de atenção
                          </span>
                        )}
                      </div>

                      {/* Primary attention snippet */}
                      {student.attentionPoints[0] && (
                        <p className="text-xs text-zinc-300 mt-2 line-clamp-1">
                          <span className="text-orange-400 font-semibold">{student.attentionPoints[0].title}:</span> {student.attentionPoints[0].whatToRemember || student.attentionPoints[0].condition}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewStudent(student.id);
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Ver Perfil"
                    >
                      <User className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
