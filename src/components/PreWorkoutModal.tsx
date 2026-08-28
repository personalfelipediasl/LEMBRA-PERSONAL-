import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Dumbbell, ShieldAlert, Sparkles, Clock, Calendar, ChevronRight } from 'lucide-react';
import { TodayAppointment, AttentionPoint, AttentionMovement } from '../types';

interface PreWorkoutModalProps {
  appointment: TodayAppointment;
  onClose: () => void;
  onConfirmReview: (appointment: TodayAppointment) => Promise<void>;
  onViewStudentProfile: (studentId: string) => void;
}

export const PreWorkoutModal: React.FC<PreWorkoutModalProps> = ({
  appointment,
  onClose,
  onConfirmReview,
  onViewStudentProfile,
}) => {
  const { student, schedule, status, lastReviewedTime } = appointment;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justConfirmed, setJustConfirmed] = useState(status === 'prepared');

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmReview(appointment);
      setJustConfirmed(true);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      console.error('Erro ao confirmar revisão:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryPoint: AttentionPoint | undefined = student.attentionPoints[0];
  const otherPoints: AttentionPoint[] = student.attentionPoints.slice(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0e0e11] border border-orange-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-orange-950/40 via-zinc-900 to-zinc-900 border-b border-orange-500/20 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-400 font-mono">
              ANTES DO TREINO
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs font-mono font-bold text-zinc-300">
              {schedule.time}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-left">
          {/* Aluno Header */}
          <div className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                ALUNO
              </span>
              <h2 className="text-2xl font-extrabold text-white font-heading">
                {student.name}
              </h2>
              {student.nickname && (
                <span className="text-xs text-orange-400 font-medium">
                  Apelido: {student.nickname}
                </span>
              )}
            </div>

            <button
              onClick={() => {
                onClose();
                onViewStudentProfile(student.id);
              }}
              className="text-xs text-orange-400 hover:text-orange-300 font-bold underline underline-offset-4 mt-1"
            >
              Ver perfil
            </button>
          </div>

          {/* If No Attention Points Registered */}
          {student.attentionPoints.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Nenhum ponto de atenção registrado
              </div>
              <p className="leading-relaxed text-zinc-300">
                Bom atendimento. Observe o aluno e conduza normalmente dentro da sua avaliação profissional.
              </p>
            </div>
          ) : (
            <>
              {/* ATENÇÃO PRINCIPAL (Orange Glow Card) */}
              {primaryPoint && (
                <div className="p-4 rounded-xl bg-[#161310] border border-orange-500/50 shadow-md space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500 text-black">
                      <AlertTriangle className="w-3 h-3 fill-black" />
                      ATENÇÃO PRINCIPAL
                    </span>
                    <h3 className="text-sm font-extrabold text-orange-300">
                      {primaryPoint.title.toUpperCase()}
                    </h3>
                  </div>

                  {/* O que você registrou */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                      O QUE VOCÊ REGISTROU:
                    </span>
                    <p className="text-zinc-200 leading-relaxed font-medium bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800">
                      {primaryPoint.condition}
                      {primaryPoint.whenHappens && ` (${primaryPoint.whenHappens})`}
                    </p>
                  </div>

                  {/* LEMBRE-SE */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wide flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-orange-400" />
                      LEMBRE-SE:
                    </span>
                    <div className="bg-orange-500/10 border border-orange-500/30 p-2.5 rounded-lg text-orange-200 font-semibold leading-relaxed">
                      {primaryPoint.whatToRemember || 'Observe a resposta do aluno durante a execução e ajuste o treinamento de acordo com a avaliação e tolerância observada.'}
                    </div>
                  </div>
                </div>
              )}

              {/* Other Attention Points if multiple */}
              {otherPoints.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    OUTROS PONTOS REGISTRADOS ({otherPoints.length}):
                  </span>
                  {otherPoints.map((pt) => (
                    <div key={pt.id} className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <span className="w-2 h-2 rounded-full bg-orange-400" />
                        <span>{pt.title}</span>
                      </div>
                      <p className="text-xs text-zinc-300">{pt.condition}</p>
                      {pt.whatToRemember && (
                        <p className="text-xs text-orange-300/90 font-medium mt-1">
                          Lembrete: {pt.whatToRemember}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* MOVIMENTOS REGISTRADOS */}
          {student.movements.length > 0 && (
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                <Dumbbell className="w-3.5 h-3.5 text-orange-400" />
                <span>MOVIMENTOS PARA LEMBRAR:</span>
              </div>
              <div className="space-y-2">
                {student.movements.map((mov) => (
                  <div key={mov.id} className="text-xs p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/80">
                    <span className="font-bold text-white block">{mov.exercise}</span>
                    <p className="text-zinc-300 mt-0.5">{mov.notes}</p>
                    {(mov.amplitude || mov.load || mov.position) && (
                      <div className="flex flex-wrap gap-2 text-[10px] text-zinc-400 mt-1">
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

          {/* OBSERVAÇÕES GERAIS */}
          {student.generalNotes && (
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                OBSERVAÇÕES ADICIONAIS:
              </span>
              <p className="text-zinc-300 leading-relaxed italic">
                &ldquo;{student.generalNotes}&rdquo;
              </p>
            </div>
          )}

          {/* Professional Nature Badge */}
          <div className="text-[10px] text-zinc-500 text-center leading-relaxed">
            Informação registrada pelo profissional para lembrete e suporte operacional.
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-4 bg-[#121215] border-t border-zinc-800/80 flex-shrink-0">
          {justConfirmed ? (
            <div className="w-full py-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center gap-2 text-emerald-300 text-sm font-extrabold uppercase tracking-wider">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
              <span>✓ Revisado e Confirmado</span>
            </div>
          ) : (
            <button
              disabled={isSubmitting}
              onClick={handleConfirm}
              className="w-full py-4 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-black font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
            >
              <CheckCircle2 className="w-5 h-5 fill-black text-orange-500" />
              <span>ENTENDI — VOU CONSIDERAR NO TREINO</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
