import React from 'react';
import { EyeOff } from 'lucide-react';
import { useAquariumStore } from '../store/aquariumStore';

export const WatchModeExit: React.FC = () => {
  const { isWatchMode, toggleWatchMode } = useAquariumStore();

  if (!isWatchMode) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => toggleWatchMode(false)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-aqua-950/70 hover:bg-aqua-900 border border-panel-border/60 hover:border-cyan-400 text-slate-300 hover:text-white backdrop-blur-md shadow-lg transition-all active:scale-95 group text-xs font-medium"
        title="Exit Fullscreen Watch Mode"
      >
        <EyeOff className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
        <span className="opacity-80 group-hover:opacity-100">Exit Watch Mode</span>
      </button>
    </div>
  );
};
