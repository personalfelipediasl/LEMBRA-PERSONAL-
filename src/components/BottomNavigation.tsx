import React from 'react';
import { Home, Users, Calendar, Settings, History } from 'lucide-react';

export type NavTab = 'home' | 'students' | 'agenda' | 'history' | 'settings';

interface BottomNavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Início', icon: Home },
    { id: 'students' as NavTab, label: 'Alunos', icon: Users },
    { id: 'agenda' as NavTab, label: 'Agenda', icon: Calendar },
    { id: 'history' as NavTab, label: 'Histórico', icon: History },
    { id: 'settings' as NavTab, label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#09090b]/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 min-w-[56px] ${
                isActive
                  ? 'text-orange-400 font-extrabold'
                  : 'text-zinc-500 hover:text-zinc-300 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'bg-orange-500/15 scale-110' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-400 stroke-[2.5]' : ''}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
