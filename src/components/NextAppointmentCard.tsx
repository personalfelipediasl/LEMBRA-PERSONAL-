import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, ChevronRight, Sparkles, User, Dumbbell } from 'lucide-react';
import { TodayAppointment } from '../types';
import { formatMinutesRemaining } from '../lib/scheduler';

interface NextAppointmentCardProps {
  appointment: TodayAppointment | null;
  onOpenPreparation: (appointment: TodayAppointment) => void;
  onViewStudent: (studentId: string) => void;
}

export const NextAppointmentCard: React.FC<NextAppointmentCardProps> = ({
  appointment,
  onOpenPreparation,
  onViewStudent,
}) => {
  if (!appointment) {
    return (
      <div className="rounded-2xl bg-[#121215] border border-zinc-800/80 p-5 text-center shadow-lg">
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500 mb-3">
          <Dumbbell className="w-6 h-6 text-zinc-600" />
        </div>
        <h3 className="text-base font-bold text-white font-heading">Nenhum atendimento restante hoje</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
          Você concluiu os horários programados para hoje ou ainda não cadastrou alunos para este dia.
        </p>
      </div>
    );
  }

  const { student, schedule, minutesRemaining, isPreparationWindow, pointsCount, status } = appointment;
  const isImminent = minutesRemaining >= -15 && minutesRemaining <= 15;
  const isPrepared = status === 'prepared';

  // Highlight points
  const firstPoint = student.attentionPoints[0];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
        isImminent && !isPrepared
          ? 'bg-gradient-to-b from-[#181512] to-[#121215] border-2 border-orange-500 orange-glow'
          : 'bg-[#121215] border border-orange-500/30'
      } p-5 shadow-xl`}
    >
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          {isImminent && !isPrepared ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-orange-500 text-black animate-pulse">
              <Sparkles className="w-3 h-3 fill-black" />
              SE PREPARE
            </span>
          ) : (
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
              PRÓXIMO ATENDIMENTO
            </span>
          )}
        </div>

        {/* Prepared status indicator */}
        {isPrepared ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" />
            Revisado
          </span>
        ) : (
          <span className="text-xs font-mono font-bold text-orange-300">
            {formatMinutesRemaining(minutesRemaining)}
          </span>
        )}
      </div>

      {/* Main Student Name & Time */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <button
            onClick={() => onViewStudent(student.id)}
            className="text-left group"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight group-hover:text-orange-400 transition-colors">
              {student.name}
            </h2>
            {student.nickname && (
              <span className="text-xs text-zinc-400 font-medium ml-1">
                &ldquo;{student.nickname}&rdquo;
              </span>
            )}
          </button>
          
          <div className="flex items-center gap-2 mt-1.5 text-zinc-300 font-medium text-sm">
            <span className="inline-flex items-center gap-1 text-orange-400 font-bold">
              <Clock className="w-4 h-4" />
              Hoje — {schedule.time}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400">
              {formatMinutesRemaining(minutesRemaining)}
            </span>
          </div>
        </div>

        {/* Avatar/Badge */}
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-orange-500/20 flex items-center justify-center flex-shrink-0 text-orange-400 font-bold text-lg">
          {student.name.slice(0, 2).toUpperCase()}
        </div>
      </div>

      {/* Attention Points Summary Pill */}
      <div className="mt-4 pt-3.5 border-t border-zinc-800/80">
        {pointsCount > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>{pointsCount} {pointsCount === 1 ? 'ponto de atenção registrado' : 'pontos de atenção registrados'}</span>
            </div>

            {/* Quick snippet of main attention point */}
            {firstPoint && (
              <div className="bg-zinc-900/80 rounded-xl p-3 border border-orange-500/20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                  <span>{firstPoint.title}</span>
                </div>
                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                  {firstPoint.whatToRemember || firstPoint.condition}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Nenhum ponto crítico registrado. Conduza conforme a rotina.</span>
          </div>
        )}
      </div>

      {/* Action Button: VER PREPARAÇÃO */}
      <div className="mt-4">
        <button
          onClick={() => onOpenPreparation(appointment)}
          className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-wider transition-all transform active:scale-[0.98] ${
            isPrepared
              ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700'
              : 'bg-orange-500 text-black hover:bg-orange-400 shadow-lg shadow-orange-500/20'
          }`}
        >
          {isPrepared ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>REVER PREPARAÇÃO</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-black" />
              <span>VER PREPARAÇÃO</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
