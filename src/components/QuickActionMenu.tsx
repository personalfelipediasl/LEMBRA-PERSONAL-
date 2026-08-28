import React, { useState } from 'react';
import { Plus, X, UserPlus, CalendarPlus, AlertTriangle } from 'lucide-react';

interface QuickActionMenuProps {
  onNewStudent: () => void;
  onNewSchedule: () => void;
  onNewAttentionPoint: () => void;
}

export const QuickActionMenu: React.FC<QuickActionMenuProps> = ({
  onNewStudent,
  onNewSchedule,
  onNewAttentionPoint,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (callback: () => void) => {
    setIsOpen(false);
    callback();
  };

  return (
    <>
      {/* Backdrop overlay when open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        />
      )}

      {/* Popover Menu Items */}
      <div className="fixed bottom-20 right-4 sm:right-8 z-40 flex flex-col items-end gap-2.5">
        {isOpen && (
          <div className="space-y-2 flex flex-col items-end animate-in slide-in-from-bottom-4 duration-200 mb-2">
            {/* Action 1: Novo Aluno */}
            <button
              onClick={() => handleAction(onNewStudent)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#141210] border border-orange-500/40 text-white font-bold text-xs shadow-xl hover:bg-zinc-900 transition-transform active:scale-95"
            >
              <span>Novo Aluno</span>
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-black flex items-center justify-center font-bold">
                <UserPlus className="w-4 h-4" />
              </div>
            </button>

            {/* Action 2: Novo Horário / Atendimento */}
            <button
              onClick={() => handleAction(onNewSchedule)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#141210] border border-orange-500/40 text-white font-bold text-xs shadow-xl hover:bg-zinc-900 transition-transform active:scale-95"
            >
              <span>Novo Atendimento / Horário</span>
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-black flex items-center justify-center font-bold">
                <CalendarPlus className="w-4 h-4" />
              </div>
            </button>

            {/* Action 3: Registrar Ponto de Atenção */}
            <button
              onClick={() => handleAction(onNewAttentionPoint)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#141210] border border-orange-500/40 text-white font-bold text-xs shadow-xl hover:bg-zinc-900 transition-transform active:scale-95"
            >
              <span>Registrar Ponto de Atenção</span>
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-black flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Ações Rápidas"
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-90 ${
            isOpen
              ? 'bg-zinc-800 text-white rotate-45 border border-zinc-700'
              : 'bg-orange-500 text-black hover:bg-orange-400 shadow-orange-500/30'
          }`}
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>
    </>
  );
};
