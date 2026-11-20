import React from 'react';
import { X, Sun, Moon, Sunset, Sunrise, Clock, Power, Sparkles } from 'lucide-react';
import { useAquariumStore } from '../store/aquariumStore';
import { LightingPreset } from '../types';

export const LightingPanel: React.FC = () => {
  const { currentTank, updateLighting, setActivePanel } = useAquariumStore();
  const { preset, manualClockHours, autoCycle, lampIntensity } = currentTank.lighting;

  const presets: { id: LightingPreset; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'dawn', label: 'Dawn', desc: 'Soft apricot & pink morning mist glow', icon: <Sunrise className="w-4 h-4 text-orange-400" /> },
    { id: 'morning', label: 'Morning', desc: 'Bright refreshing angled sunlight', icon: <Sun className="w-4 h-4 text-yellow-300" /> },
    { id: 'afternoon', label: 'Afternoon', desc: 'Vibrant full-spectrum daylight & caustics', icon: <Sun className="w-4 h-4 text-amber-400" /> },
    { id: 'dusk', label: 'Dusk', desc: 'Warm amber glow, softened shadows', icon: <Sunset className="w-4 h-4 text-rose-400" /> },
    { id: 'night', label: 'Night', desc: 'Deep calm aquatic twilight', icon: <Moon className="w-4 h-4 text-blue-400" /> },
    { id: 'midnight', label: 'Midnight Moonlight', desc: 'Silver-blue surface shimmer & silhouettes', icon: <Sparkles className="w-4 h-4 text-cyan-300" /> },
    { id: 'off', label: 'Lights Off', desc: 'Total darkness; fish sleep & rest', icon: <Power className="w-4 h-4 text-slate-400" /> }
  ];

  const formatHours = (h: number): string => {
    const hrs = Math.floor(h);
    const mins = Math.floor((h - hrs) * 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const handleClockChange = (val: number) => {
    let newPreset: LightingPreset = preset;
    if (val >= 5 && val < 8) newPreset = 'dawn';
    else if (val >= 8 && val < 12) newPreset = 'morning';
    else if (val >= 12 && val < 18) newPreset = 'afternoon';
    else if (val >= 18 && val < 21) newPreset = 'dusk';
    else if (val >= 21 && val < 23) newPreset = 'night';
    else if (val >= 23 || val < 5) newPreset = 'midnight';

    updateLighting({
      manualClockHours: val,
      preset: newPreset
    });
  };

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-aqua-950/95 backdrop-blur-xl border border-panel-border rounded-2xl p-4 shadow-2xl z-30 max-h-[75vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-panel-border">
        <div>
          <h3 className="font-bold text-white text-base">Diurnal Lighting & Atmosphere</h3>
          <p className="text-xs text-aqua-300 font-medium">Control sun angles, moonlight, and day cycles</p>
        </div>
        <button
          onClick={() => setActivePanel(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-aqua-900/60"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 pt-3 text-xs">
        {/* Presets Grid */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
            Atmospheric Mood Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map(p => (
              <button
                key={p.id}
                onClick={() => updateLighting({ preset: p.id })}
                className={`p-2.5 rounded-xl text-left border flex items-start space-x-2 transition-all ${
                  preset === p.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-aqua-glow'
                    : 'bg-aqua-900/40 border-panel-border text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="mt-0.5">{p.icon}</div>
                <div>
                  <div className="font-semibold text-xs">{p.label}</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{p.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 24-Hour Solar Clock Slider */}
        <div className="bg-aqua-900/40 p-3 rounded-xl border border-panel-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-aqua-400" />
              <span>24-Hour Solar Clock</span>
            </span>
            <span className="font-mono text-aqua-300 font-bold text-sm">
              {formatHours(manualClockHours)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="23.9"
            step="0.1"
            value={manualClockHours}
            onChange={e => handleClockChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-aqua-950 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>00:00 Night</span>
            <span>06:00 Dawn</span>
            <span>12:00 Noon</span>
            <span>18:00 Dusk</span>
            <span>23:59</span>
          </div>
        </div>

        {/* Auto Day/Night Cycle Toggle & Lamp Intensity */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-aqua-900/40 p-3 rounded-xl border border-panel-border flex flex-col justify-between">
            <div className="text-slate-300 font-semibold text-xs">Day/Night Auto-Cycle</div>
            <div className="text-[10px] text-slate-400 mt-0.5 mb-2">Simulates natural sunrise to sunset</div>
            <button
              onClick={() => updateLighting({ autoCycle: !autoCycle })}
              className={`py-1.5 rounded-lg text-center font-medium transition-all ${
                autoCycle
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-aqua-950 text-slate-400 hover:text-white border border-panel-border'
              }`}
            >
              {autoCycle ? 'Auto-Cycle Active' : 'Manual Mode'}
            </button>
          </div>

          <div className="bg-aqua-900/40 p-3 rounded-xl border border-panel-border">
            <div className="flex justify-between text-slate-300 font-semibold mb-1">
              <span>Lamp Intensity</span>
              <span className="font-mono text-aqua-300">{Math.round(lampIntensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={lampIntensity}
              onChange={e => updateLighting({ lampIntensity: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-aqua-950 rounded-lg appearance-none cursor-pointer mt-3"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
