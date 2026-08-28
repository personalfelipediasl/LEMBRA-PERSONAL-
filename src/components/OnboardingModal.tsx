import React from 'react';
import { Sparkles, Shield, UserPlus, ArrowRight, Dumbbell, Bell } from 'lucide-react';

interface OnboardingModalProps {
  onStart: () => void;
  onAddNewStudent: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onStart, onAddNewStudent }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#0e0e11] border border-orange-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-5">
        {/* Glow & Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-black shadow-xl shadow-orange-500/30">
          <Dumbbell className="w-8 h-8 stroke-[2.5]" />
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black border-2 border-orange-400 flex items-center justify-center">
            <Bell className="w-2.5 h-2.5 text-orange-400" />
          </div>
        </div>

        {/* Title & Concept */}
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-400 font-mono">
            LEMBRA PERSONAL
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight leading-tight">
            NÃO CONFIE NA MEMÓRIA.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-sm mx-auto">
            Você atende várias pessoas ao longo do dia. Cada aluno possui cuidados, restrições e dores diferentes.
          </p>
        </div>

        {/* Value Proposition bullets */}
        <div className="text-left space-y-2.5 bg-[#141210] p-4 rounded-2xl border border-orange-500/20 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="text-orange-400 font-bold">•</span>
            <p className="text-zinc-200 leading-snug">
              <strong>Lembretes na hora certa:</strong> receba avisos antes de cada atendimento.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-orange-400 font-bold">•</span>
            <p className="text-zinc-200 leading-snug">
              <strong>Memória operacional:</strong> revise dores, restrições e amplitude em 5 segundos.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-orange-400 font-bold">•</span>
            <p className="text-zinc-200 leading-snug">
              <strong>100% no seu celular:</strong> sem cadastros externos, sem IA e totalmente offline.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={onAddNewStudent}
            className="w-full py-4 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98"
          >
            <UserPlus className="w-4 h-4" />
            <span>CADASTRAR PRIMEIRO ALUNO</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onStart}
            className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-colors border border-zinc-800"
          >
            COMEÇAR (EXPLORAR COM EXEMPLOS)
          </button>
        </div>

        {/* Small subtitle */}
        <p className="text-[10px] text-zinc-500">
          Seu aluno. Seus cuidados. Na hora certa.
        </p>
      </div>
    </div>
  );
};
