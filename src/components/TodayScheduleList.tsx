import React, { useState } from 'react';
import { Search, CheckCircle2, AlertTriangle, Bell, Clock, User, ChevronRight } from 'lucide-react';
import { TodayAppointment } from '../types';

interface TodayScheduleListProps {
  appointments: TodayAppointment[];
  onOpenPreparation: (appointment: TodayAppointment) => void;
  onViewStudent: (studentId: string) => void;
  onAddNewStudent: () => void;
}

export const TodayScheduleList: React.FC<TodayScheduleListProps> = ({
  appointments,
  onOpenPreparation,
  onViewStudent,
  onAddNewStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAppointments = appointments.filter((app) => {
    const term = searchTerm.toLowerCase();
    return (
      app.student.name.toLowerCase().includes(term) ||
      (app.student.nickname && app.student.nickname.toLowerCase().includes(term)) ||
      app.time.includes(term)
    );
  });

  return (
    <div className="space-y-3">
      {/* Header & Quick Search */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-extrabold uppercase tracking-wider text-white font-heading">
            HOJE
          </h3>
          <p className="text-xs text-zinc-400">
            {appointments.length} {appointments.length === 1 ? 'atendimento programado' : 'atendimentos programados'}
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar aluno de hoje..."
          className="w-full bg-[#121215] text-sm text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 border border-zinc-800 focus:border-orange-500 focus:outline-none transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white px-1.5 py-0.5 rounded bg-zinc-800"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="rounded-xl bg-[#121215] border border-zinc-800 p-6 text-center">
          {searchTerm ? (
            <p className="text-xs text-zinc-400">Nenhum aluno encontrado com o termo &ldquo;{searchTerm}&rdquo;.</p>
          ) : (
            <div>
              <p className="text-xs text-zinc-400">Nenhum atendimento na lista para hoje.</p>
              <button
                onClick={onAddNewStudent}
                className="mt-3 text-xs font-bold text-orange-400 hover:text-orange-300 underline underline-offset-4"
              >
                + Cadastrar Aluno ou Horário
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAppointments.map((app) => {
            const { student, time, pointsCount, status } = app;
            const isPrepared = status === 'prepared';
            const hasPoints = pointsCount > 0;

            return (
              <div
                key={app.id}
                onClick={() => onOpenPreparation(app)}
                className={`group rounded-xl p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 ${
                  isPrepared
                    ? 'bg-[#121215]/60 border border-zinc-800/80 hover:border-zinc-700'
                    : hasPoints
                    ? 'bg-[#141210] border border-orange-500/30 hover:border-orange-500/60 shadow-sm'
                    : 'bg-[#121215] border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Left Time & Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col items-center justify-center w-12 py-1 rounded-lg bg-zinc-900 border border-zinc-800 flex-shrink-0">
                    <span className="text-xs font-mono font-bold text-orange-400">{time}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-orange-300 transition-colors">
                        {student.name}
                      </h4>
                      {student.nickname && (
                        <span className="text-[11px] text-zinc-400 hidden xs:inline">
                          ({student.nickname})
                        </span>
                      )}
                    </div>

                    {/* Status Text & Indicators */}
                    <div className="flex items-center gap-2 mt-0.5">
                      {isPrepared ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Preparado
                        </span>
                      ) : hasPoints ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                          <AlertTriangle className="w-3 h-3 text-orange-400" />
                          {pointsCount} {pointsCount === 1 ? 'ponto de atenção' : 'pontos de atenção'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                          <Bell className="w-3 h-3 text-zinc-500" />
                          Lembrete programado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Arrow / Action button */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewStudent(student.id);
                    }}
                    title="Ver perfil completo"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <User className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
