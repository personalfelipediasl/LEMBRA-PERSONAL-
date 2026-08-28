import React, { useState } from 'react';
import { X, Edit3, Trash2, Calendar, Clock, AlertTriangle, Dumbbell, ShieldAlert, CheckCircle2, Phone, Sparkles, UserCheck, UserX } from 'lucide-react';
import { Student, DAYS_OF_WEEK_LABELS, DayOfWeek } from '../types';

interface StudentProfileModalProps {
  student: Student;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => Promise<void>;
  onToggleStatus: (student: Student) => Promise<void>;
  onOpenPreparationDirectly: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
  onOpenPreparationDirectly,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(student.id);
      onClose();
    } catch (err) {
      console.error('Erro ao excluir aluno:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e0e11] border border-orange-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Profile Header */}
        <div className="p-5 bg-gradient-to-b from-[#181512] to-[#121215] border-b border-zinc-800 flex items-start justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-zinc-900 border border-orange-500/30 flex items-center justify-center text-orange-400 font-extrabold text-xl shadow-lg">
              {student.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                  {student.name}
                </h2>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    student.status === 'active'
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {student.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {student.nickname && (
                <p className="text-xs text-orange-400 font-medium">
                  Apelido: {student.nickname}
                </p>
              )}

              {student.phone && (
                <div className="flex items-center gap-1 text-xs text-zinc-400 mt-1">
                  <Phone className="w-3 h-3 text-zinc-500" />
                  <span>{student.phone}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Profile Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-left flex-1">
          {/* Quick Actions Bar */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenPreparationDirectly(student)}
              className="py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              Simular Preparação
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700"
            >
              <Edit3 className="w-3.5 h-3.5 text-orange-400" />
              Editar Aluno
            </button>
          </div>

          {/* Horários / Agenda */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span>DIAS E HORÁRIOS DE ATENDIMENTO</span>
            </div>

            {student.schedules.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">Nenhum horário fixo cadastrado.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {student.schedules.map((sch) => (
                  <div
                    key={sch.id}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs"
                  >
                    <span className="text-zinc-300 font-semibold">
                      {DAYS_OF_WEEK_LABELS[sch.dayOfWeek as DayOfWeek]?.long || `Dia ${sch.dayOfWeek}`}
                    </span>
                    <span className="text-orange-400 font-mono font-bold">{sch.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pontos de Atenção */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>PONTOS DE ATENÇÃO ({student.attentionPoints.length})</span>
              </div>
            </div>

            {student.attentionPoints.length === 0 ? (
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Nenhum ponto de atenção ou dor registrado para este aluno.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {student.attentionPoints.map((pt) => (
                  <div
                    key={pt.id}
                    className="p-3.5 rounded-xl bg-[#141210] border border-orange-500/30 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-white">{pt.title}</h4>
                      <span className="text-[10px] uppercase font-bold text-orange-300 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                        {pt.category}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="text-zinc-200">
                        <span className="font-bold text-zinc-400">Condição / Relato:</span> {pt.condition}
                      </p>
                      {pt.whenHappens && (
                        <p className="text-zinc-300">
                          <span className="font-bold text-zinc-400">Quando acontece:</span> {pt.whenHappens}
                        </p>
                      )}
                      {pt.relatedMovements && pt.relatedMovements.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center mt-1">
                          <span className="text-[10px] text-zinc-400 font-bold">Movimentos:</span>
                          {pt.relatedMovements.map((m, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="p-2 rounded bg-orange-500/10 border border-orange-500/20 text-orange-200 font-medium text-xs mt-1">
                        <span className="font-bold text-orange-400">Lembrete para o treino:</span> {pt.whatToRemember}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Movimentos de Atenção */}
          {student.movements.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                <Dumbbell className="w-3.5 h-3.5 text-orange-400" />
                <span>MOVIMENTOS PARA LEMBRAR ({student.movements.length})</span>
              </div>

              <div className="space-y-2">
                {student.movements.map((mov) => (
                  <div key={mov.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                    <span className="font-bold text-white block">{mov.exercise}</span>
                    <p className="text-zinc-300">{mov.notes}</p>
                    {(mov.amplitude || mov.load || mov.position) && (
                      <div className="flex flex-wrap gap-2 text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                        {mov.amplitude && <span>Amp: {mov.amplitude}</span>}
                        {mov.load && <span>Carga: {mov.load}</span>}
                        {mov.position && <span>Pos: {mov.position}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observações Gerais */}
          {student.generalNotes && (
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                OBSERVAÇÕES GERAIS
              </span>
              <p className="text-zinc-300 leading-relaxed italic">
                &ldquo;{student.generalNotes}&rdquo;
              </p>
            </div>
          )}

          {/* Configuração de Lembretes do Aluno */}
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>Antecedência dos lembretes:</span>
            </div>
            <span className="font-bold text-white font-mono">
              {student.reminderSettings?.leadTimes?.join(', ') || '10'} min antes
            </span>
          </div>

          {/* Danger Zone / Delete & Status */}
          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
            <button
              onClick={() => onToggleStatus(student)}
              className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5"
            >
              {student.status === 'active' ? (
                <>
                  <UserX className="w-3.5 h-3.5" />
                  Pausar aluno
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Ativar aluno
                </>
              )}
            </button>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs font-semibold text-zinc-500 hover:text-red-400 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir aluno
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-red-400 font-bold">Confirmar?</span>
                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  Sim, Excluir
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
