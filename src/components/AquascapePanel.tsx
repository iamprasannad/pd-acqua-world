import React, { useState } from 'react';
import { X, Plus, Trash2, Undo2, RotateCw, FlipHorizontal, Maximize2 } from 'lucide-react';
import { useAquariumStore } from '../store/aquariumStore';
import { DECOR_CATALOG } from '../data/decorCatalog';
import { DecorItem } from '../types';

export const AquascapePanel: React.FC = () => {
  const {
    currentTank,
    addDecor,
    updateDecor,
    removeDecor,
    undoDecor,
    decorHistory,
    setActivePanel
  } = useAquariumStore();

  const [selectedDecorId, setSelectedDecorId] = useState<string | null>(
    currentTank.decor.length > 0 ? currentTank.decor[0].id : null
  );

  const selectedItem = currentTank.decor.find(d => d.id === selectedDecorId);

  // Filter catalog by tank water type
  const availableCatalog = DECOR_CATALOG.filter(
    item => item.waterTypeSuitability === 'both' || item.waterTypeSuitability === currentTank.waterType
  );

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[95%] max-w-lg bg-aqua-950/95 backdrop-blur-xl border border-panel-border rounded-2xl p-4 shadow-2xl z-30 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-panel-border">
        <div>
          <h3 className="font-bold text-white text-base">Aquascaping & Hardscape Studio</h3>
          <p className="text-xs text-aqua-300 font-medium">Position, scale, rotate, and style plants and hardscape</p>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={undoDecor}
            disabled={decorHistory.length === 0}
            className={`p-1.5 rounded-lg border text-xs flex items-center space-x-1 ${
              decorHistory.length > 0
                ? 'bg-aqua-900 border-panel-border text-cyan-300 hover:text-white'
                : 'text-slate-600 border-transparent cursor-not-allowed'
            }`}
            title="Undo Last Edit"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </button>
          <button
            onClick={() => setActivePanel(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-aqua-900/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-3 text-xs">
        {/* Decor Catalog Add Grid */}
        <div>
          <label className="block text-slate-300 font-semibold mb-2 uppercase tracking-wider text-[10px]">
            Add Botanical & Hardscape Elements ({currentTank.waterType})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableCatalog.map(item => (
              <button
                key={item.type}
                onClick={() => addDecor(item.type, item.name)}
                className="p-2.5 rounded-xl border border-panel-border bg-aqua-900/40 hover:bg-aqua-800/60 hover:border-cyan-400 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-white group-hover:text-cyan-300">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{item.description}</div>
                </div>
                <div className="mt-2 text-[10px] text-cyan-400 font-medium flex items-center space-x-1">
                  <Plus className="w-3 h-3" />
                  <span>Place in Tank</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tank Inhabited Decor List & Adjuster */}
        {currentTank.decor.length > 0 && (
          <div className="pt-3 border-t border-panel-border space-y-3">
            <label className="block text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
              Active Elements in Aquarium (Click to select & fine-tune)
            </label>
            <div className="flex space-x-1.5 overflow-x-auto pb-1">
              {currentTank.decor.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDecorId(d.id)}
                  className={`px-3 py-1.5 rounded-xl border font-medium text-xs whitespace-nowrap transition-all ${
                    selectedDecorId === d.id
                      ? 'bg-cyan-600 text-white shadow-sm border-cyan-400'
                      : 'bg-aqua-900/50 border-panel-border text-slate-300 hover:text-white'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            {selectedItem && (
              <div className="bg-aqua-900/40 p-3 rounded-xl border border-panel-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{selectedItem.name}</span>
                  <button
                    onClick={() => removeDecor(selectedItem.id)}
                    className="flex items-center space-x-1 text-rose-400 hover:text-rose-300 text-xs font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                {/* Horizontal Position (X) */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Horizontal Position (Left ↔ Right)</span>
                    <span className="font-mono text-cyan-300">{Math.round(selectedItem.x * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.01"
                    value={selectedItem.x}
                    onChange={e => updateDecor(selectedItem.id, { x: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-aqua-950 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Vertical Position (Y) */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Vertical Position (Depth)</span>
                    <span className="font-mono text-cyan-300">{Math.round(selectedItem.y * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="0.9"
                    step="0.01"
                    value={selectedItem.y}
                    onChange={e => updateDecor(selectedItem.id, { y: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-aqua-950 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Scale & Rotation */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Scale Size</span>
                      <span className="font-mono text-cyan-300">{selectedItem.scale.toFixed(2)}×</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.8"
                      step="0.05"
                      value={selectedItem.scale}
                      onChange={e => updateDecor(selectedItem.id, { scale: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-aqua-950 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Tilt Rotation</span>
                      <span className="font-mono text-cyan-300">{selectedItem.rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      step="1"
                      value={selectedItem.rotation}
                      onChange={e => updateDecor(selectedItem.id, { rotation: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-aqua-950 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Layering & Mirror Flip */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400 mr-1.5">Layer:</span>
                    {(['back', 'mid', 'front'] as const).map(zone => (
                      <button
                        key={zone}
                        onClick={() => updateDecor(selectedItem.id, { depthZone: zone })}
                        className={`px-2.5 py-1 rounded-lg capitalize font-medium ${
                          selectedItem.depthZone === zone
                            ? 'bg-cyan-600 text-white'
                            : 'bg-aqua-950 text-slate-400 border border-panel-border'
                        }`}
                      >
                        {zone}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => updateDecor(selectedItem.id, { flipped: !selectedItem.flipped })}
                    className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1 font-medium ${
                      selectedItem.flipped
                        ? 'bg-cyan-600 text-white border-cyan-400'
                        : 'bg-aqua-950 text-slate-300 border-panel-border'
                    }`}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    <span>Flip Horiz</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
