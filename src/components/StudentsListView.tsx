import React, { useState } from 'react';
import { UserPlus, Search, User, AlertTriangle, CheckCircle2, ChevronRight, Calendar, Clock, Sparkles } from 'lucide-react';
import { Student, DAYS_OF_WEEK_LABELS, DayOfWeek } from '../types';

interface StudentsListViewProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onAddNewStudent: () => void;
  onOpenPreparationDirectly: (student: Student) => void;
}

export const StudentsListView: React.FC<StudentsListViewProps> = ({
  students,
  onSelectStudent,
  onAddNewStudent,
  onOpenPreparationDirectly,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('active');

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nickname && s.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.attentionPoints.some((pt) => pt.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && s.status === filterStatus;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white font-heading tracking-tight">
            ALUNOS CADASTRADOS
          </h2>
          <p className="text-xs text-zinc-400">
            {students.length} {students.length === 1 ? 'aluno no total' : 'alunos no total'}
          </p>
        </div>

        <button
          onClick={onAddNewStudent}
          className="py-2.5 px-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ NOVO ALUNO</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nome, apelido ou dor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Filter Pills */}
        <div className="flex gap-2">
          {[
            { id: 'active', label: `Ativos (${students.filter((s) => s.status === 'active').length})` },
            { id: 'all', label: `Todos (${students.length})` },
            { id: 'inactive', label: `Inativos (${students.filter((s) => s.status === 'inactive').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as 'all' | 'active' | 'inactive')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                filterStatus === tab.id
                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/40'
                  : 'bg-[#121215] text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <div className="rounded-2xl bg-[#121215] border border-zinc-800 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <User className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-white">Nenhum aluno encontrado</p>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            {searchTerm
              ? 'Tente buscar com outro termo ou limpe o campo de busca.'
              : 'Cadastre seus alunos para receber lembretes automáticos dos cuidados antes de cada treino.'}
          </p>
          {!searchTerm && (
            <button
              onClick={onAddNewStudent}
              className="mt-2 py-2.5 px-4 rounded-xl bg-orange-500 text-black font-bold text-xs inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Cadastrar Primeiro Aluno
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student) => {
            const pointsCount = student.attentionPoints.length;
            const primaryPoint = student.attentionPoints[0];

            return (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student)}
                className="group rounded-2xl bg-[#121215] border border-zinc-800 hover:border-orange-500/40 p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Avatar & Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-orange-500/20 flex items-center justify-center flex-shrink-0 text-orange-400 font-extrabold text-base group-hover:border-orange-500 transition-colors">
                      {student.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-white truncate group-hover:text-orange-400 transition-colors">
                          {student.name}
                        </h3>
                        {student.status === 'inactive' && (
                          <span className="text-[10px] uppercase font-bold text-zinc-500 px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800">
                            Inativo
                          </span>
                        )}
                      </div>

                      {student.nickname && (
                        <p className="text-xs text-orange-400/90 font-medium">
                          &ldquo;{student.nickname}&rdquo;
                        </p>
                      )}

                      {/* Schedules pill */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {student.schedules.slice(0, 3).map((sch) => (
                          <span
                            key={sch.id}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300"
                          >
                            {DAYS_OF_WEEK_LABELS[sch.dayOfWeek as DayOfWeek]?.short} {sch.time}
                          </span>
                        ))}
                        {student.schedules.length > 3 && (
                          <span className="text-[10px] text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-900">
                            +{student.schedules.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Action */}
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                </div>

                {/* Attention Point Highlight Box */}
                <div className="mt-3 pt-3 border-t border-zinc-800/80">
                  {pointsCount > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                        <span>
                          {pointsCount} {pointsCount === 1 ? 'ponto de atenção' : 'pontos de atenção'}:
                        </span>
                        <span className="text-white font-semibold truncate">
                          {primaryPoint?.title}
                        </span>
                      </div>
                      {primaryPoint?.whatToRemember && (
                        <p className="text-xs text-zinc-400 line-clamp-1 italic pl-5">
                          &ldquo;{primaryPoint.whatToRemember}&rdquo;
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sem restrições ou dores registradas</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
