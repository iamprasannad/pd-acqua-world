import React, { useState } from 'react';
import {
  Eye,
  Volume2,
  VolumeX,
  FolderOpen,
  Thermometer,
  Droplets,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAquariumStore } from '../store/aquariumStore';

export const Header: React.FC = () => {
  const {
    currentTank,
    isWatchMode,
    toggleWatchMode,
    isAudioMuted,
    toggleAudio,
    setActivePanel,
    activePanel
  } = useAquariumStore();

  const [logoLoadError, setLogoLoadError] = useState(false);

  if (isWatchMode) return null;

  return (
    <header className="h-16 px-4 md:px-6 bg-aqua-950/80 backdrop-blur-md border-b border-panel-border flex items-center justify-between z-30 shrink-0">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        {!logoLoadError ? (
          <img
            src="./logo.svg"
            alt="PD Acqua World"
            className="h-10 w-auto object-contain cursor-pointer"
            onError={() => setLogoLoadError(true)}
            onClick={() => setActivePanel('tank_builder')}
          />
        ) : (
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setActivePanel('tank_builder')}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-sm shadow-aqua-glow">
              PD
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-wider text-white">
                PD <span className="text-aqua-400">ACQUA</span> <span className="text-slate-400 font-light">WORLD</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-aqua-400/80 -mt-1 font-semibold">
                Living Aquarium Simulator
              </span>
            </div>
          </div>
        )}

        {/* Current Tank Name Badge */}
        <div className="hidden sm:flex items-center space-x-2 bg-aqua-900/60 border border-aqua-500/20 px-2.5 py-1 rounded-full text-xs text-aqua-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium truncate max-w-[140px] md:max-w-[200px]">
            {currentTank.name}
          </span>
          <span className="text-[10px] uppercase text-aqua-400/70 border-l border-aqua-500/20 pl-1.5">
            {currentTank.waterType}
          </span>
        </div>
      </div>

      {/* Quick Telemetry & Actions */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Measured Temperature Readout */}
        <button
          onClick={() => setActivePanel('equipment')}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-aqua-900/50 hover:bg-aqua-800/60 border border-panel-border text-xs text-aqua-100 transition-colors"
          title="Measured Water Temperature (Click for Equipment)"
        >
          <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono font-medium">
            {currentTank.equipment.measuredTemp.toFixed(1)}°C
          </span>
        </button>

        {/* Water Clarity */}
        <button
          onClick={() => setActivePanel('equipment')}
          className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-aqua-900/50 hover:bg-aqua-800/60 border border-panel-border text-xs text-aqua-100 transition-colors"
          title="Water Clarity"
        >
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono">
            {Math.round(currentTank.clarityPercent)}% Clarity
          </span>
        </button>

        {/* Time / Lighting Preset Badge */}
        <button
          onClick={() => setActivePanel('lighting')}
          className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-aqua-900/50 hover:bg-aqua-800/60 border border-panel-border text-xs text-aqua-200 capitalize transition-colors"
          title="Lighting Atmosphere (Click to change)"
        >
          <Clock className="w-3.5 h-3.5 text-aqua-300" />
          <span>{currentTank.lighting.preset.replace('_', ' ')}</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={toggleAudio}
          className={`p-2 rounded-lg border transition-colors ${
            !isAudioMuted
              ? 'bg-aqua-500/20 border-aqua-400/50 text-aqua-300'
              : 'bg-aqua-900/50 border-panel-border text-slate-400 hover:text-white'
          }`}
          title={isAudioMuted ? 'Unmute Ambient Sounds' : 'Mute Sounds'}
        >
          {!isAudioMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Saved Tanks Modal Button */}
        <button
          onClick={() => setActivePanel(activePanel === 'save_manager' ? null : 'save_manager')}
          className={`p-2 rounded-lg border transition-colors ${
            activePanel === 'save_manager'
              ? 'bg-aqua-500/20 border-aqua-400/50 text-aqua-300'
              : 'bg-aqua-900/50 border-panel-border text-slate-300 hover:text-white'
          }`}
          title="Manage Saved Tanks"
        >
          <FolderOpen className="w-4 h-4" />
        </button>

        {/* Watch Mode Button */}
        <button
          onClick={() => toggleWatchMode(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-aqua-glow transition-all active:scale-95"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Watch Mode</span>
        </button>
      </div>
    </header>
  );
};
