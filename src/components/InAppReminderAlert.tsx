import React from 'react';
import { Bell, X, Sparkles, ChevronRight, AlertTriangle } from 'lucide-react';
import { TodayAppointment } from '../types';

interface InAppReminderAlertProps {
  alert: {
    appointment: TodayAppointment;
    leadTime: number;
    message: string;
  } | null;
  onOpenPreparation: (appointment: TodayAppointment) => void;
  onDismiss: () => void;
}

export const InAppReminderAlert: React.FC<InAppReminderAlertProps> = ({
  alert,
  onOpenPreparation,
  onDismiss,
}) => {
  if (!alert) return null;

  const { appointment, leadTime } = alert;
  const { student, schedule } = appointment;

  return (
    <div className="fixed top-16 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="rounded-2xl bg-[#181410] border-2 border-orange-500 p-4 shadow-2xl orange-glow flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-black flex items-center justify-center flex-shrink-0 font-extrabold animate-pulse">
              <Bell className="w-4 h-4 fill-black" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 font-mono block">
                ATENDIMENTO EM {leadTime} MINUTOS
              </span>
              <h4 className="text-sm font-extrabold text-white">
                {student.name} chega às {schedule.time}
              </h4>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {student.attentionPoints.length > 0 ? (
          <div className="text-xs text-zinc-300 bg-zinc-950/80 p-2.5 rounded-xl border border-orange-500/20">
            <span className="text-orange-400 font-bold block mb-0.5">
              ⚠️ Ponto de Atenção: {student.attentionPoints[0].title}
            </span>
            <p className="line-clamp-1 text-zinc-300">
              {student.attentionPoints[0].whatToRemember || student.attentionPoints[0].condition}
            </p>
          </div>
        ) : (
          <p className="text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/20">
            ✓ Nenhum ponto crítico registrado para este aluno.
          </p>
        )}

        <button
          onClick={() => {
            onOpenPreparation(appointment);
            onDismiss();
          }}
          className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/30 transition-transform active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 fill-black" />
          <span>ABRIR PREPARAÇÃO AGORA</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
