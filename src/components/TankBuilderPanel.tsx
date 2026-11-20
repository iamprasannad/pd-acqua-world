import React, { useState } from 'react';
import { X, Layers, Droplets, Info, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useAquariumStore } from '../store/aquariumStore';
import { TankShape, WaterType, SubstrateType, BackgroundType } from '../types';
import { calculateTankVolume } from '../utils/tankGeometry';

export const TankBuilderPanel: React.FC = () => {
  const {
    currentTank,
    updateTank,
    setTankShape,
    loadPreset,
    setActivePanel
  } = useAquariumStore();

  const [activeTab, setActiveTab] = useState<'shape' | 'dimensions' | 'styling' | 'presets'>('shape');

  const shapes: { id: TankShape; label: string; desc: string }[] = [
    { id: 'rectangular', label: 'Classic Rectangular', desc: 'Standard golden ratio aquarium' },
    { id: 'panoramic', label: 'Long Panoramic', desc: 'Extended horizontal swimming runway for schooling fish' },
    { id: 'bowl', label: 'Round Glass Bowl', desc: 'Spherical profile, curved waterline & narrow base' },
    { id: 'cylinder', label: 'Cylindrical Column', desc: 'Curved panoramic viewing & vertical column' },
    { id: 'cube', label: 'Rimless Cube', desc: '1:1:1 nano minimalist cube proportions' },
    { id: 'shallow', label: 'Shallow Planted', desc: 'Low height, broad water surface area' },
    { id: 'portrait', label: 'Tall Portrait', desc: 'Dramatic vertical biotope height' },
    { id: 'bowfront', label: 'Bow-Front Curved Glass', desc: 'Gentle convex front viewing glass lens' },
    { id: 'hexagonal', label: 'Hexagonal Prism', desc: '6-sided faceted geometry' },
    { id: 'corner', label: 'Corner Angled Face', desc: 'Quarter-round angled viewing prism' }
  ];

  const substrates: { id: SubstrateType; label: string; desc: string; color: string }[] = [
    { id: 'sand', label: 'Fine River Sand', desc: 'Natural golden quartz sand, great for bottom sifters', color: '#fef08a' },
    { id: 'gravel', label: 'Fine River Gravel', desc: 'Multi-toned natural rounded pebbles', color: '#a8a29e' },
    { id: 'dark_soil', label: 'Dark Planted Aquasoil', desc: 'Nutrient-rich dark substrate for lush roots', color: '#3f3f46' },
    { id: 'coral_sand', label: 'Crushed Aragonite Coral', desc: 'Buffers pH & alkalinity for marine reef setups', color: '#f8fafc' }
  ];

  const backgrounds: { id: BackgroundType; label: string; preview: string }[] = [
    { id: 'planted_aqua', label: 'Planted Nature Aqua', preview: 'from-emerald-700 to-teal-950' },
    { id: 'deep_blue', label: 'Deep Ocean Blue', preview: 'from-sky-600 to-blue-950' },
    { id: 'midnight_black', label: 'Midnight Black', preview: 'from-slate-800 to-slate-950' },
    { id: 'slate_rock', label: 'Slate Rock', preview: 'from-slate-600 to-slate-900' },
    { id: 'horizon_gradient', label: 'Horizon Gradient', preview: 'from-cyan-400 to-blue-900' },
    { id: 'frosted_glass', label: 'Frosted Glass', preview: 'from-slate-400 to-slate-700' }
  ];

  const vol = calculateTankVolume(currentTank.shape, currentTank.dimensions, currentTank.waterLevelPercent);

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[95%] max-w-lg bg-aqua-950/95 backdrop-blur-xl border border-panel-border rounded-2xl p-4 shadow-2xl z-30 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-panel-border">
        <div>
          <h3 className="font-bold text-white text-base">Tank Architect & Customizer</h3>
          <p className="text-xs text-aqua-300 font-medium">Design geometry, water type, and substrate</p>
        </div>
        <button
          onClick={() => setActivePanel(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-aqua-900/60"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-panel-border mt-3 pb-2 text-xs">
        {[
          { id: 'presets', label: 'Starting Presets' },
          { id: 'shape', label: 'Tank Form' },
          { id: 'dimensions', label: 'Dimensions & Volume' },
          { id: 'styling', label: 'Water & Substrate' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-aqua-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-3 text-xs space-y-4">
        {/* PRESETS TAB */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <div className="text-slate-300 font-semibold text-xs">Starting Paths:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => loadPreset('blue_fin')}
                className="p-3 rounded-xl border border-blue-500/40 bg-blue-950/40 text-left hover:border-blue-400 transition-all group"
              >
                <div className="font-bold text-white group-hover:text-cyan-300 flex items-center justify-between">
                  <span>Blue Fin’s Home</span>
                  <span className="text-[10px] bg-blue-500/20 text-cyan-300 px-1.5 py-0.5 rounded">Default</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">Planted freshwater home of Blue Fin the Betta with broad leaves & driftwood.</div>
              </button>

              <button
                onClick={() => loadPreset('tropical')}
                className="p-3 rounded-xl border border-panel-border bg-aqua-900/30 text-left hover:border-cyan-400 transition-all group"
              >
                <div className="font-bold text-white group-hover:text-cyan-300">Tropical Community</div>
                <div className="text-[11px] text-slate-300 mt-1">Long panoramic tank with schooling Neon Tetras, Panda Corydoras & Guppies.</div>
              </button>

              <button
                onClick={() => loadPreset('shrimp')}
                className="p-3 rounded-xl border border-panel-border bg-aqua-900/30 text-left hover:border-cyan-400 transition-all group"
              >
                <div className="font-bold text-white group-hover:text-cyan-300">Planted Shrimp Tank</div>
                <div className="text-[11px] text-slate-300 mt-1">Shallow lush aquascape with grazing Cherry Shrimp, moss balls & root wood.</div>
              </button>

              <button
                onClick={() => loadPreset('reef')}
                className="p-3 rounded-xl border border-panel-border bg-aqua-900/30 text-left hover:border-cyan-400 transition-all group"
              >
                <div className="font-bold text-white group-hover:text-cyan-300">Marine Coral Reef</div>
                <div className="text-[11px] text-slate-300 mt-1">Bow-front saltwater oasis with Clownfish pair, Royal Gramma & live corals.</div>
              </button>

              <button
                onClick={() => loadPreset('empty')}
                className="p-3 rounded-xl border border-dashed border-panel-border bg-aqua-900/20 text-left hover:border-slate-400 transition-all group col-span-1 sm:col-span-2"
              >
                <div className="font-bold text-slate-200 group-hover:text-white">Empty Custom Tank</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Start with a completely blank aquarium and design every detail from scratch.</div>
              </button>
            </div>
          </div>
        )}

        {/* SHAPE TAB */}
        {activeTab === 'shape' && (
          <div>
            <label className="block text-slate-300 font-semibold mb-2 uppercase tracking-wider text-[10px]">
              Select Tank Geometry
            </label>
            <div className="grid grid-cols-2 gap-2">
              {shapes.map(s => {
                const isSelected = currentTank.shape === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setTankShape(s.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-aqua-glow'
                        : 'bg-aqua-900/40 border-panel-border text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center justify-between">
                      <span>{s.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-tight">{s.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* DIMENSIONS & VOLUME TAB */}
        {activeTab === 'dimensions' && (
          <div className="space-y-4">
            {/* Volume Readout Card */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300">
                  Calculated Usable Habitat Volume
                </span>
                <div className="font-mono text-2xl font-black text-white flex items-baseline space-x-1">
                  <span>~{vol.volumeLiters}</span>
                  <span className="text-sm font-semibold text-cyan-400">Liters</span>
                  {vol.isApproximate && (
                    <span className="text-[10px] font-sans text-slate-400 ml-2">
                      (approx. calculated volume)
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Formula: {vol.formulaDescription}
                </div>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-3 bg-aqua-900/40 p-3 rounded-xl border border-panel-border">
              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Width (Front Viewing Face)</span>
                  <span className="font-mono text-cyan-300">{currentTank.dimensions.widthCm} cm</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="150"
                  value={currentTank.dimensions.widthCm}
                  onChange={e => updateTank({ dimensions: { ...currentTank.dimensions, widthCm: parseInt(e.target.value) } })}
                  className="w-full h-1.5 bg-aqua-950 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Height</span>
                  <span className="font-mono text-cyan-300">{currentTank.dimensions.heightCm} cm</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={currentTank.dimensions.heightCm}
                  onChange={e => updateTank({ dimensions: { ...currentTank.dimensions, heightCm: parseInt(e.target.value) } })}
                  className="w-full h-1.5 bg-aqua-950 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Depth</span>
                  <span className="font-mono text-cyan-300">{currentTank.dimensions.depthCm} cm</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={currentTank.dimensions.depthCm}
                  onChange={e => updateTank({ dimensions: { ...currentTank.dimensions, depthCm: parseInt(e.target.value) } })}
                  className="w-full h-1.5 bg-aqua-950 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Water Fill Level</span>
                  <span className="font-mono text-cyan-300">{currentTank.waterLevelPercent}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="98"
                  value={currentTank.waterLevelPercent}
                  onChange={e => updateTank({ waterLevelPercent: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-aqua-950 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* STYLING TAB */}
        {activeTab === 'styling' && (
          <div className="space-y-4">
            {/* Water Type Toggle */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                Water Salinity Ecosystem
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateTank({ waterType: 'freshwater' })}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                    currentTank.waterType === 'freshwater'
                      ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-sm'
                      : 'bg-aqua-900/40 border-panel-border text-slate-400 hover:text-white'
                  }`}
                >
                  Freshwater (Rivers & Streams)
                </button>
                <button
                  onClick={() => updateTank({ waterType: 'marine' })}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                    currentTank.waterType === 'marine'
                      ? 'bg-blue-600/30 border-cyan-400 text-cyan-200 shadow-sm'
                      : 'bg-aqua-900/40 border-panel-border text-slate-400 hover:text-white'
                  }`}
                >
                  Marine (Saltwater Coral Reef)
                </button>
              </div>
            </div>

            {/* Substrate */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                Substrate Bedding
              </label>
              <div className="grid grid-cols-2 gap-2">
                {substrates.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => updateTank({ substrate: sub.id })}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      currentTank.substrate === sub.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-white'
                        : 'bg-aqua-900/40 border-panel-border text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: sub.color }} />
                      <span className="font-semibold text-xs">{sub.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-tight">{sub.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Style */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                Aquarium Background Vinyl
              </label>
              <div className="grid grid-cols-3 gap-2">
                {backgrounds.map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => updateTank({ background: bg.id })}
                    className={`p-1.5 rounded-xl border text-center transition-all ${
                      currentTank.background === bg.id
                        ? 'border-cyan-400 ring-2 ring-cyan-500/30'
                        : 'border-panel-border hover:border-slate-500'
                    }`}
                  >
                    <div className={`h-8 rounded-lg bg-gradient-to-b ${bg.preview} mb-1`} />
                    <span className="text-[10px] font-medium text-slate-300 block truncate">{bg.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
