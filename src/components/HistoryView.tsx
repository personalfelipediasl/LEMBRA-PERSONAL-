import React from 'react';
import { History, CheckCircle2, Bell, Clock, Calendar, ShieldCheck, User } from 'lucide-react';
import { SessionHistory } from '../types';

interface HistoryViewProps {
  history: SessionHistory[];
  onViewStudent: (studentId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onViewStudent }) => {
  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-xl font-extrabold text-white font-heading tracking-tight">
          HISTÓRICO OPERACIONAL
        </h2>
        <p className="text-xs text-zinc-400">
          Registro de lembretes emitidos e confirmações de preparação antes dos treinos.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl bg-[#121215] border border-zinc-800 p-8 text-center space-y-2">
          <History className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-sm font-bold text-white">Nenhum registro ainda</p>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Quando você abrir a preparação de um aluno e clicar em &ldquo;ENTENDI — VOU CONSIDERAR NO TREINO&rdquo;, a confirmação ficará registrada aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.map((entry) => {
            const dateObj = new Date(entry.reviewedAt || entry.scheduledDate);
            const dateFormatted = dateObj.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            });
            const timeFormatted = dateObj.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={entry.id}
                className="rounded-xl p-3.5 bg-[#121215] border border-zinc-800/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewStudent(entry.studentId)}
                      className="text-sm font-bold text-white hover:text-orange-400 text-left transition-colors"
                    >
                      {entry.studentName}
                    </button>
                    <span className="text-xs text-zinc-400 font-mono">
                      — {dateFormatted} às {entry.scheduledTime}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500">
                    {timeFormatted}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/60 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <Bell className="w-3.5 h-3.5 text-orange-400" />
                    <span>✓ Lembrete processado</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓ Pontos revisados</span>
                  </div>
                </div>

                {entry.pointsCount > 0 && (
                  <div className="text-[11px] text-orange-300/80 bg-orange-500/5 px-2 py-1 rounded border border-orange-500/15">
                    {entry.pointsCount} {entry.pointsCount === 1 ? 'ponto de atenção considerado' : 'pontos de atenção considerados'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
