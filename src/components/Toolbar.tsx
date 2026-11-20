import React from 'react';
import {
  Utensils,
  SunMoon,
  Box,
  Fish,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { useAquariumStore, ActivePanel } from '../store/aquariumStore';

export const Toolbar: React.FC = () => {
  const { activePanel, setActivePanel, isWatchMode } = useAquariumStore();

  if (isWatchMode) return null;

  const handleToggle = (panel: ActivePanel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const navItems: { id: ActivePanel; label: string; icon: React.ReactNode; primary?: boolean }[] = [
    {
      id: 'feed',
      label: 'Feed',
      icon: <Utensils className="w-5 h-5" />,
      primary: true
    },
    {
      id: 'lighting',
      label: 'Lighting',
      icon: <SunMoon className="w-5 h-5" />,
      primary: true
    },
    {
      id: 'tank_builder',
      label: 'Build Tank',
      icon: <Box className="w-5 h-5" />,
      primary: true
    },
    {
      id: 'species',
      label: 'Species',
      icon: <Fish className="w-5 h-5" />
    },
    {
      id: 'equipment',
      label: 'Equipment',
      icon: <Sliders className="w-5 h-5" />
    },
    {
      id: 'aquascape',
      label: 'Aquascape',
      icon: <Sparkles className="w-5 h-5" />
    }
  ];

  return (
    <div className="shrink-0 flex flex-col items-center z-20 pb-2 md:pb-4 px-3 pointer-events-none">
      {/* Feeding active prompt banner */}
      {activePanel === 'feed' && (
        <div className="mb-2 px-4 py-1.5 rounded-full bg-cyan-900/90 border border-cyan-400/60 shadow-aqua-glow backdrop-blur-md text-white text-xs md:text-sm font-medium flex items-center space-x-2 animate-bounce pointer-events-auto">
          <Info className="w-4 h-4 text-cyan-300" />
          <span>Tap the water to drop food.</span>
        </div>
      )}

      {/* Main Docked Navigation Bar */}
      <nav className="pointer-events-auto bg-aqua-950/85 backdrop-blur-lg border border-panel-border/80 shadow-aqua-card rounded-2xl p-1.5 flex items-center space-x-1 sm:space-x-2">
        {navItems.map(item => {
          const isActive = activePanel === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`flex items-center space-x-1.5 px-3 md:px-4 py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all active:scale-95 min-h-[44px] ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-aqua-glow'
                  : item.primary
                  ? 'text-aqua-100 hover:text-white hover:bg-aqua-900/60'
                  : 'text-slate-400 hover:text-aqua-200 hover:bg-aqua-900/40'
              }`}
            >
              {item.icon}
              <span className="font-semibold tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
