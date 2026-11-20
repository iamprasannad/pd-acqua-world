import React, { useState } from 'react';
import {
  X,
  Save,
  FolderOpen,
  Copy,
  Trash2,
  Edit2,
  Check,
  Calendar,
  Layers,
  Fish
} from 'lucide-react';
import { useAquariumStore } from '../store/aquariumStore';

export const SaveManagerModal: React.FC = () => {
  const {
    currentTank,
    savedTanks,
    saveCurrentTank,
    loadSavedTank,
    duplicateSavedTank,
    deleteSavedTank,
    setActivePanel
  } = useAquariumStore();

  const [tankNameInput, setTankNameInput] = useState(currentTank.name);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleSave = () => {
    saveCurrentTank(tankNameInput);
  };

  const handleDelete = (id: string) => {
    deleteSavedTank(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-aqua-950/95 border border-panel-border rounded-2xl w-full max-w-lg p-5 shadow-2xl max-h-[85vh] flex flex-col text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-panel-border shrink-0">
          <div>
            <h3 className="font-bold text-white text-base">Aquarium Collection Manager</h3>
            <p className="text-xs text-aqua-300 font-medium">Save, load, duplicate, and organize custom tanks</p>
          </div>
          <button
            onClick={() => setActivePanel(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-aqua-900/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Save Current Tank Box */}
        <div className="my-4 p-3.5 rounded-xl bg-aqua-900/40 border border-panel-border shrink-0 space-y-2">
          <label className="block text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
            Save Current Aquarium Snapshot
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={tankNameInput}
              onChange={e => setTankNameInput(e.target.value)}
              placeholder="Aquarium Name..."
              className="flex-1 px-3 py-2 rounded-xl bg-aqua-950 border border-panel-border text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-aqua-glow transition-all active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Tank</span>
            </button>
          </div>
        </div>

        {/* Saved Tanks List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            Saved Aquariums ({savedTanks.length})
          </div>

          {savedTanks.length === 0 ? (
            <div className="p-6 text-center text-slate-400 border border-dashed border-panel-border rounded-xl">
              <FolderOpen className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-60" />
              <p className="font-medium text-slate-300">No custom tanks saved yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Save your current aquarium setup above to reload it anytime!
              </p>
            </div>
          ) : (
            savedTanks.map(tank => {
              const isActive = currentTank.id === tank.id;
              const isConfirmingDelete = deleteConfirmId === tank.id;

              return (
                <div
                  key={tank.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-cyan-950/40 border-cyan-400/80 shadow-aqua-glow'
                      : 'bg-aqua-900/30 border-panel-border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-white text-sm">{tank.name}</h4>
                        {isActive && (
                          <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-1">
                        <span className="capitalize">{tank.shape} shape</span>
                        <span>•</span>
                        <span className="capitalize">{tank.waterType}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Fish className="w-3 h-3 text-cyan-400" />
                          <span>{tank.inhabitants.length} inhabitants</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1">
                      {!isActive && (
                        <button
                          onClick={() => loadSavedTank(tank.id)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors"
                        >
                          Load
                        </button>
                      )}

                      <button
                        onClick={() => duplicateSavedTank(tank.id)}
                        className="p-1.5 rounded-lg bg-aqua-900 hover:bg-aqua-800 text-slate-300 hover:text-white border border-panel-border"
                        title="Duplicate Tank"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(tank.id)}
                        className="p-1.5 rounded-lg bg-aqua-900 hover:bg-rose-950 text-slate-300 hover:text-rose-400 border border-panel-border"
                        title="Delete Tank"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Delete Confirmation Modal inline */}
                  {isConfirmingDelete && (
                    <div className="mt-3 p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/60 flex items-center justify-between animate-in fade-in">
                      <span className="text-rose-200 font-medium text-[11px]">
                        Permanently delete this saved aquarium?
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDelete(tank.id)}
                          className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-500"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
