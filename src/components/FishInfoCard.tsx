import React, { useState } from 'react';
import { X, Heart, Utensils, Edit2, Check, ExternalLink } from 'lucide-react';
import { useAquariumStore } from '../store/aquariumStore';
import { getSpeciesById } from '../data/speciesData';

export const FishInfoCard: React.FC = () => {
  const { currentTank, selectedFishId, setSelectedFishId, renameFish, removeFish } = useAquariumStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  if (!selectedFishId) return null;

  const fish = currentTank.inhabitants.find(f => f.id === selectedFishId);
  if (!fish) return null;

  const species = getSpeciesById(fish.speciesId);
  if (!species) return null;

  const handleStartRename = () => {
    setNewName(fish.name);
    setIsEditingName(true);
  };

  const handleSaveRename = () => {
    if (newName.trim()) {
      renameFish(fish.id, newName.trim());
    }
    setIsEditingName(false);
  };

  const formatBehavior = (b: string): string => {
    switch (b) {
      case 'cruising': return 'Cruising smoothly through water';
      case 'turning': return 'Banking and navigating current';
      case 'resting': return 'Resting and conserving energy';
      case 'exploring': return 'Investigating decor & crevices';
      case 'approaching_food': return 'Sensing and pursuing food particle';
      case 'eating': return 'Taking a bite and nibbling';
      case 'returning_to_zone': return 'Returning to preferred depth layer';
      case 'rising_for_air': return 'Surfacing to breathe atmospheric oxygen';
      case 'schooling': return 'Schooling in sync with group';
      case 'grazing': return 'Grazing biofilm & microalgae';
      default: return b;
    }
  };

  return (
    <div className="absolute top-20 right-4 w-[90%] max-w-sm bg-aqua-950/95 backdrop-blur-xl border border-panel-border rounded-2xl p-4 shadow-2xl z-30 text-xs animate-in fade-in slide-in-from-top-4">
      {/* Header */}
      <div className="flex items-start justify-between pb-2 border-b border-panel-border">
        <div className="flex-1 mr-2">
          {isEditingName ? (
            <div className="flex items-center space-x-1.5">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="px-2 py-0.5 rounded bg-aqua-900 border border-cyan-400 text-white font-bold text-sm w-full focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveRename}
                className="p-1 rounded bg-cyan-600 text-white hover:bg-cyan-500"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h4 className="font-extrabold text-white text-base truncate">{fish.name}</h4>
              <button
                onClick={handleStartRename}
                className="text-slate-400 hover:text-cyan-300 p-0.5"
                title="Rename fish"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <p className="text-[11px] text-cyan-300 font-medium">{species.commonName}</p>
          <p className="text-[10px] text-slate-400 italic">{species.scientificName}</p>
        </div>

        <button
          onClick={() => setSelectedFishId(null)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-aqua-900/60"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Real-time Activity Indicator */}
      <div className="my-3 p-2.5 rounded-xl bg-aqua-900/50 border border-cyan-500/30 flex items-center space-x-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Current Live Behavior
          </span>
          <span className="font-semibold text-white text-xs">
            {formatBehavior(fish.behavior)}
          </span>
        </div>
      </div>

      {/* Vitals: Health & Satiety */}
      <div className="grid grid-cols-2 gap-2 my-2.5">
        <div className="bg-aqua-900/40 p-2 rounded-lg border border-panel-border">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
            <span className="flex items-center space-x-1">
              <Heart className="w-3 h-3 text-rose-400" />
              <span>Vitality</span>
            </span>
            <span className="font-mono text-white font-bold">{Math.round(fish.health)}%</span>
          </div>
          <div className="w-full bg-aqua-950 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${fish.health}%` }} />
          </div>
        </div>

        <div className="bg-aqua-900/40 p-2 rounded-lg border border-panel-border">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
            <span className="flex items-center space-x-1">
              <Utensils className="w-3 h-3 text-amber-400" />
              <span>Satiety</span>
            </span>
            <span className="font-mono text-white font-bold">
              {fish.hunger < 25 ? 'Full' : fish.hunger < 60 ? 'Content' : 'Hungry'}
            </span>
          </div>
          <div className="w-full bg-aqua-950 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full"
              style={{ width: `${Math.max(10, 100 - fish.hunger)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Biological Care Summary */}
      <div className="bg-aqua-900/30 p-2.5 rounded-lg border border-panel-border space-y-1 text-[11px] text-slate-300">
        <div><span className="font-semibold text-slate-400">Habitat:</span> <span className="capitalize">{species.habitat}</span></div>
        <div><span className="font-semibold text-slate-400">Preferred Zone:</span> <span className="capitalize">{species.preferredZone}</span></div>
        <div><span className="font-semibold text-slate-400">Dietary Needs:</span> <span className="capitalize">{species.diet}</span></div>
        <div className="pt-1 text-[10px] text-slate-400">
          {species.sources[0] && (
            <a
              href={species.sources[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center space-x-1"
            >
              <span>{species.sources[0].title}</span>
              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
            </a>
          )}
        </div>
      </div>

      {/* Action footer */}
      <div className="mt-3 pt-2 border-t border-panel-border flex justify-end">
        <button
          onClick={() => removeFish(fish.id)}
          className="text-rose-400 hover:text-rose-300 text-[11px] font-medium"
        >
          Release fish from tank
        </button>
      </div>
    </div>
  );
};
