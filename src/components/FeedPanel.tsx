import React from 'react';
import { X, Sparkles, Trash2, Check } from 'lucide-react';
import { useAquariumStore } from '../store/aquariumStore';
import { FoodType, FoodPortion, FoodParticleSize } from '../types';

export const FeedPanel: React.FC = () => {
  const {
    feedConfig,
    setFeedConfig,
    removeLeftovers,
    currentTank,
    setActivePanel
  } = useAquariumStore();

  const foodTypes: { id: FoodType; label: string; desc: string }[] = [
    { id: 'pellets', label: 'Floating Pellets', desc: 'Floats on surface, ideal for Bettas & surface dwellers' },
    { id: 'granules', label: 'Slow-Sinking Granules', desc: 'Slowly descends through midwater column' },
    { id: 'flakes', label: 'Crisp Flakes', desc: 'Flutters in currents, loved by community fish' },
    { id: 'wafers', label: 'Sinking Wafers', desc: 'Dense disc that drops straight to bottom for Corydoras & Shrimp' }
  ];

  const portions: { id: FoodPortion; label: string; count: string }[] = [
    { id: 'pinch', label: 'Pinch', count: '3 pcs' },
    { id: 'medium', label: 'Standard', count: '6 pcs' },
    { id: 'generous', label: 'Generous', count: '12 pcs' }
  ];

  const sizes: { id: FoodParticleSize; label: string }[] = [
    { id: 'tiny', label: 'Tiny (Nano)' },
    { id: 'medium', label: 'Medium' },
    { id: 'large', label: 'Large' }
  ];

  const presetColors: { label: string; hex: string }[] = [
    { label: 'Natural Brown', hex: '#854d0e' },
    { label: 'Ruby Red', hex: '#ef4444' },
    { label: 'Vibrant Orange', hex: '#f97316' },
    { label: 'Spirulina Green', hex: '#22c55e' },
    { label: 'Golden Yellow', hex: '#eab308' }
  ];

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-aqua-950/95 backdrop-blur-xl border border-panel-border rounded-2xl p-4 shadow-2xl z-30 max-h-[75vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-panel-border">
        <div>
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <span>Fish Feeding Station</span>
          </h3>
          <p className="text-xs text-aqua-300 font-medium">Tap the water to drop food.</p>
        </div>
        <button
          onClick={() => setActivePanel(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-aqua-900/60"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 pt-3 text-xs">
        {/* Food Type */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
            Diet Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {foodTypes.map(ft => (
              <button
                key={ft.id}
                onClick={() => setFeedConfig({ type: ft.id })}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  feedConfig.type === ft.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-aqua-glow'
                    : 'bg-aqua-900/40 border-panel-border text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="font-semibold text-xs">{ft.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{ft.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Portion & Particle Size */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
              Portion Size
            </label>
            <div className="flex rounded-lg bg-aqua-900/50 p-1 border border-panel-border">
              {portions.map(p => (
                <button
                  key={p.id}
                  onClick={() => setFeedConfig({ portion: p.id })}
                  className={`flex-1 py-1 rounded text-center font-medium transition-all ${
                    feedConfig.portion === p.id
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
              Granule Size
            </label>
            <div className="flex rounded-lg bg-aqua-900/50 p-1 border border-panel-border">
              {sizes.map(s => (
                <button
                  key={s.id}
                  onClick={() => setFeedConfig({ size: s.id })}
                  className={`flex-1 py-1 rounded text-center font-medium transition-all ${
                    feedConfig.size === s.id
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Food Color */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
            Food Color
          </label>
          <div className="flex items-center space-x-2">
            {presetColors.map(c => {
              const isSelected = feedConfig.color.toLowerCase() === c.hex.toLowerCase();
              return (
                <button
                  key={c.hex}
                  onClick={() => setFeedConfig({ color: c.hex })}
                  style={{ backgroundColor: c.hex }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                    isSelected ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={c.label}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              );
            })}

            {/* Custom Color Input */}
            <div className="flex items-center space-x-1 pl-2 border-l border-panel-border">
              <input
                type="color"
                value={feedConfig.color}
                onChange={e => setFeedConfig({ color: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                title="Custom Color"
              />
              <span className="font-mono text-[10px] text-slate-400">{feedConfig.color}</span>
            </div>
          </div>
        </div>

        {/* Leftovers Maintenance Action */}
        <div className="pt-2 border-t border-panel-border flex items-center justify-between">
          <div>
            <div className="text-slate-300 font-medium">Accumulated Leftovers</div>
            <div className="text-[11px] text-slate-400">
              {currentTank.leftoversCount > 0
                ? `${currentTank.leftoversCount} uneaten decaying particles`
                : 'Substrate is clean'}
            </div>
          </div>
          <button
            onClick={removeLeftovers}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-aqua-900 hover:bg-aqua-800 text-aqua-200 border border-panel-border font-medium hover:text-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Remove leftovers</span>
          </button>
        </div>
      </div>
    </div>
  );
};
