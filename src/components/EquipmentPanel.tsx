import React from 'react';
import {
  X,
  Thermometer,
  Wind,
  Droplets,
  Play,
  Pause,
  FastForward,
  Info,
  Power
} from 'lucide-react';
import { useAquariumStore } from '../store/aquariumStore';

export const EquipmentPanel: React.FC = () => {
  const { currentTank, updateEquipment, setActivePanel } = useAquariumStore();
  const eq = currentTank.equipment;

  const tempDiff = eq.heaterEnabled ? eq.heaterTargetTemp - eq.measuredTemp : eq.roomTemp - eq.measuredTemp;
  const tempStatus = Math.abs(tempDiff) < 0.1
    ? 'At Target'
    : tempDiff > 0
    ? 'Heating...'
    : 'Cooling...';

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-aqua-950/95 backdrop-blur-xl border border-panel-border rounded-2xl p-4 shadow-2xl z-30 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-panel-border">
        <div>
          <h3 className="font-bold text-white text-base">Life Support & Equipment</h3>
          <p className="text-xs text-aqua-300 font-medium">Thermal, filtration, aeration & speed control</p>
        </div>
        <button
          onClick={() => setActivePanel(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-aqua-900/60"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 pt-3 text-xs">
        {/* Simulation Speed Selector (0x, 1x, 5x) */}
        <div className="bg-aqua-900/40 p-3 rounded-xl border border-panel-border">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-slate-300">Simulation Velocity</span>
            <span className="font-mono text-cyan-300 font-bold">
              {eq.simSpeed === 0 ? 'Paused (0×)' : `${eq.simSpeed}× Real-time`}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => updateEquipment({ simSpeed: 0 })}
              className={`py-2 rounded-xl flex items-center justify-center space-x-1.5 font-bold transition-all ${
                eq.simSpeed === 0
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-aqua-950/80 text-slate-400 hover:text-white border border-panel-border'
              }`}
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>

            <button
              onClick={() => updateEquipment({ simSpeed: 1 })}
              className={`py-2 rounded-xl flex items-center justify-center space-x-1.5 font-bold transition-all ${
                eq.simSpeed === 1
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-aqua-950/80 text-slate-400 hover:text-white border border-panel-border'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>1× Normal</span>
            </button>

            <button
              onClick={() => updateEquipment({ simSpeed: 5 })}
              className={`py-2 rounded-xl flex items-center justify-center space-x-1.5 font-bold transition-all ${
                eq.simSpeed === 5
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-aqua-950/80 text-slate-400 hover:text-white border border-panel-border'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>5× Fast</span>
            </button>
          </div>
        </div>

        {/* Precision Submersible Heater */}
        <div className="bg-aqua-900/40 p-3 rounded-xl border border-panel-border space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-rose-400" />
              <span className="font-semibold text-white">Submersible Heater</span>
            </div>
            <button
              onClick={() => updateEquipment({ heaterEnabled: !eq.heaterEnabled })}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center space-x-1 ${
                eq.heaterEnabled
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <Power className="w-3 h-3" />
              <span>{eq.heaterEnabled ? 'Heater On' : 'Heater Off'}</span>
            </button>
          </div>

          {/* Separate Measured vs Target Temp Readout */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-aqua-950 p-2 rounded-lg border border-panel-border">
              <span className="text-[10px] text-slate-400 block">Measured Water Temp</span>
              <span className="font-mono text-lg font-black text-cyan-300">
                {eq.measuredTemp.toFixed(1)}°C
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">{tempStatus}</span>
            </div>

            <div className="bg-aqua-950 p-2 rounded-lg border border-panel-border">
              <span className="text-[10px] text-slate-400 block">Heater Thermostat Target</span>
              <span className="font-mono text-lg font-black text-rose-300">
                {eq.heaterTargetTemp.toFixed(1)}°C
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                {eq.heaterEnabled ? 'Regulating' : `Drifting to room (${eq.roomTemp}°C)`}
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Thermostat Target Slider</span>
              <span className="font-mono text-rose-300 font-bold">{eq.heaterTargetTemp.toFixed(1)}°C</span>
            </div>
            <input
              type="range"
              min="18.0"
              max="32.0"
              step="0.5"
              value={eq.heaterTargetTemp}
              onChange={e => updateEquipment({ heaterTargetTemp: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-aqua-950 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>18°C Coldwater</span>
              <span>25°C Tropical</span>
              <span>32°C High</span>
            </div>
          </div>
        </div>

        {/* Bio-Mechanical Filtration & Flow Current */}
        <div className="bg-aqua-900/40 p-3 rounded-xl border border-panel-border space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-white">Canister Filter & Powerhead</span>
            </div>
            <button
              onClick={() => updateEquipment({ filterEnabled: !eq.filterEnabled })}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                eq.filterEnabled
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {eq.filterEnabled ? 'Running' : 'Stopped'}
            </button>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Flow Current Strength</span>
              <span className="font-mono text-cyan-300 font-bold">{Math.round(eq.filterFlowStrength * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1.0"
              step="0.05"
              value={eq.filterFlowStrength}
              onChange={e => updateEquipment({ filterFlowStrength: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-aqua-950 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Flow visibly sways aquatic plants and drifts suspended food particles.
            </span>
          </div>
        </div>

        {/* Aeration Air Stone */}
        <div className="bg-aqua-900/40 p-3 rounded-xl border border-panel-border space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4 text-sky-300" />
              <span className="font-semibold text-white">Aerator & Micro-Bubble Stone</span>
            </div>
            <button
              onClick={() => updateEquipment({ aerationEnabled: !eq.aerationEnabled })}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                eq.aerationEnabled
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {eq.aerationEnabled ? 'Bubbling' : 'Off'}
            </button>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Aeration Intensity</span>
              <span className="font-mono text-sky-300 font-bold">{Math.round(eq.aerationStrength * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={eq.aerationStrength}
              onChange={e => updateEquipment({ aerationStrength: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-aqua-950 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Educational simulation label */}
        <div className="p-2.5 rounded-lg bg-aqua-950/60 border border-panel-border flex items-start space-x-2 text-[10px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            Simplified educational simulation: thermal inertia, waste breakdown, and fluid turbulence follow biological and physical approximations.
          </span>
        </div>
      </div>
    </div>
  );
};
