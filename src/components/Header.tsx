import React from 'react';
import { Bell, ShieldCheck, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { NotificationPermissionState } from '../lib/notifications';

interface HeaderProps {
  notificationStatus: NotificationPermissionState;
  onRequestNotifications: () => void;
  currentTime: Date;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  notificationStatus,
  onRequestNotifications,
  currentTime,
  onOpenSettings,
}) => {
  const formattedTime = currentTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedDate = currentTime.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-[#09090b]/95 backdrop-blur-md border-b border-orange-500/15 px-4 py-3 sm:px-6">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/20 text-black font-extrabold text-lg">
            LP
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-white font-heading">
                LEMBRA PERSONAL
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                PRO
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium leading-none mt-0.5">
              Seu painel de atendimentos
            </p>
          </div>
        </div>

        {/* Right Info: Live Time & Notification Pill */}
        <div className="flex items-center gap-2">
          {/* Notification quick badge */}
          {notificationStatus === 'granted' ? (
            <button
              onClick={onOpenSettings}
              title="Notificações ativas"
              className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/60 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">Ativo</span>
            </button>
          ) : (
            <button
              onClick={onRequestNotifications}
              title="Clique para ativar lembretes"
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 hover:bg-orange-500/30 transition-all animate-pulse"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="text-[11px]">Ativar</span>
            </button>
          )}

          {/* Live Clock Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-mono font-bold text-white tracking-wider">
              {formattedTime}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
