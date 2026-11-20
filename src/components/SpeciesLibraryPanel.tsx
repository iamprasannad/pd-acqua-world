import React, { useState } from 'react';
import {
  X,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  Info,
  Thermometer,
  Maximize2
} from 'lucide-react';
import { useAquariumStore } from '../store/aquariumStore';
import { SPECIES_CATALOG } from '../data/speciesData';
import { SpeciesData } from '../types';
import { evaluateSpeciesCompatibility } from '../utils/compatibilityEvaluator';

export const SpeciesLibraryPanel: React.FC = () => {
  const { currentTank, addFish, setActivePanel } = useAquariumStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterHabitat, setFilterHabitat] = useState<'all' | 'freshwater' | 'marine'>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesData>(SPECIES_CATALOG[0]);
  const [quantity, setQuantity] = useState(1);
  const [customName, setCustomName] = useState('');

  const filteredSpecies = SPECIES_CATALOG.filter(s => {
    const matchesSearch = s.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHabitat = filterHabitat === 'all' || s.habitat === filterHabitat;
    return matchesSearch && matchesHabitat;
  });

  const compatibility = evaluateSpeciesCompatibility(selectedSpecies, quantity, currentTank);

  const handleAdd = () => {
    if (!compatibility.isCompatible) return;
    addFish(selectedSpecies.id, quantity, customName.trim() || undefined);
    setCustomName('');
    setQuantity(1);
  };

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-aqua-950/95 backdrop-blur-xl border border-panel-border rounded-2xl p-4 shadow-2xl z-30 max-h-[82vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-panel-border shrink-0">
        <div>
          <h3 className="font-bold text-white text-base">Species Library & Care Compendium</h3>
          <p className="text-xs text-aqua-300 font-medium">13 authentic species with verified biological parameters</p>
        </div>
        <button
          onClick={() => setActivePanel(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-aqua-900/60"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Habitat Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-2 pt-3 pb-2 shrink-0">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by common or scientific name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-aqua-900/40 border border-panel-border text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex rounded-lg bg-aqua-900/50 p-1 border border-panel-border text-xs shrink-0">
          {(['all', 'freshwater', 'marine'] as const).map(hab => (
            <button
              key={hab}
              onClick={() => setFilterHabitat(hab)}
              className={`px-3 py-1 rounded capitalize font-medium transition-all ${
                filterHabitat === hab ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {hab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left List, Right Detail */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 overflow-y-auto min-h-0 text-xs">
        {/* Left: Species Selector List */}
        <div className="md:col-span-5 space-y-1.5 max-h-56 md:max-h-96 overflow-y-auto pr-1">
          {filteredSpecies.map(sp => {
            const isSelected = selectedSpecies.id === sp.id;
            const evalReport = evaluateSpeciesCompatibility(sp, 1, currentTank);
            return (
              <button
                key={sp.id}
                onClick={() => {
                  setSelectedSpecies(sp);
                  setQuantity(sp.socialBehavior === 'schooling' ? sp.minGroupSize : 1);
                }}
                className={`w-full p-2.5 rounded-xl text-left border flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-aqua-glow'
                    : 'bg-aqua-900/30 border-panel-border text-slate-300 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="font-semibold text-xs flex items-center space-x-1.5">
                    <span>{sp.commonName}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 italic">{sp.scientificName}</div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold ${
                    sp.habitat === 'freshwater' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-cyan-300'
                  }`}>
                    {sp.habitat}
                  </span>
                  {!evalReport.isCompatible && (
                    <span title="Incompatible with current tank">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Species Profile, Compatibility Evaluation & Add Controls */}
        <div className="md:col-span-7 space-y-3 bg-aqua-900/30 p-3.5 rounded-xl border border-panel-border overflow-y-auto">
          {/* Title & Habitat */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-white text-sm">{selectedSpecies.commonName}</h4>
              <p className="text-[11px] text-slate-400 italic">{selectedSpecies.scientificName}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
              selectedSpecies.habitat === 'freshwater' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-cyan-300'
            }`}>
              {selectedSpecies.habitat}
            </span>
          </div>

          {/* Quick Biology Specs */}
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="bg-aqua-950/60 p-2 rounded-lg border border-panel-border">
              <span className="text-slate-400 block">Adult Size</span>
              <span className="font-mono text-cyan-300 font-bold">{selectedSpecies.adultSizeCm} cm</span>
            </div>
            <div className="bg-aqua-950/60 p-2 rounded-lg border border-panel-border">
              <span className="text-slate-400 block">Ideal Temp</span>
              <span className="font-mono text-amber-300 font-bold">{selectedSpecies.minTempC}° - {selectedSpecies.maxTempC}°C</span>
            </div>
            <div className="bg-aqua-950/60 p-2 rounded-lg border border-panel-border">
              <span className="text-slate-400 block">Social Behavior</span>
              <span className="capitalize text-slate-200 font-bold">{selectedSpecies.socialBehavior.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Interesting Fact */}
          <div className="bg-aqua-950/40 p-2.5 rounded-lg border border-panel-border text-[11px] text-slate-300">
            <span className="font-bold text-cyan-300 block mb-0.5">Biological Fact:</span>
            {selectedSpecies.interestingFact}
          </div>

          {/* Source Links with Verified Badge */}
          <div className="flex items-center space-x-2 text-[10px]">
            <span className="text-emerald-400 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified Care Data</span>
            </span>
            <div className="flex items-center space-x-2 text-slate-400">
              {selectedSpecies.sources.map(src => (
                <a
                  key={src.url}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-300 flex items-center space-x-0.5 underline"
                >
                  <span>{src.title.split('—')[0]}</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Compatibility Evaluation Report */}
          <div className={`p-2.5 rounded-xl border ${
            !compatibility.isCompatible
              ? 'bg-rose-950/50 border-rose-500/50 text-rose-200'
              : compatibility.score < 80
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
          }`}>
            <div className="font-bold flex items-center space-x-1.5 text-xs">
              {!compatibility.isCompatible ? (
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              ) : compatibility.score < 80 ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span>{compatibility.statusSummary}</span>
            </div>

            {compatibility.issues.length > 0 && (
              <div className="mt-2 space-y-1.5 text-[11px]">
                {compatibility.issues.map((iss, i) => (
                  <div key={i} className="pl-2 border-l-2 border-current">
                    <p className="font-medium">{iss.message}</p>
                    <p className="text-[10px] opacity-80 mt-0.5">{iss.recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quantity & Name Controls */}
          <div className="space-y-2 pt-2 border-t border-panel-border">
            <div className="flex items-center space-x-3">
              {/* Quantity Stepper */}
              <div className="flex items-center space-x-1.5 bg-aqua-950 px-2 py-1 rounded-lg border border-panel-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 hover:text-cyan-300 text-slate-400"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-bold text-white px-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 hover:text-cyan-300 text-slate-400"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Custom Name (for single fish) */}
              {quantity === 1 && (
                <input
                  type="text"
                  placeholder="Give your fish a name..."
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-aqua-950 border border-panel-border text-white text-xs placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />
              )}

              {/* Add Button */}
              <button
                disabled={!compatibility.isCompatible}
                onClick={handleAdd}
                className={`px-4 py-2 rounded-xl font-bold transition-all shadow-md active:scale-95 ${
                  compatibility.isCompatible
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-aqua-glow'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                Add to Tank
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
