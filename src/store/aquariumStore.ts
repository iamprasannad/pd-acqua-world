import { create } from 'zustand';
import {
  TankConfig,
  FishInstance,
  FoodParticle,
  Bubble,
  SurfaceRipple,
  FoodType,
  FoodPortion,
  FoodParticleSize,
  DecorItem,
  EquipmentState,
  LightingState,
  TankShape
} from '../types';
import {
  createBlueFinsHome,
  createTropicalCommunityPreset,
  createPlantedShrimpPreset,
  createMarineReefPreset,
  createEmptyCustomTank
} from '../data/tankPresets';
import { getSpeciesById } from '../data/speciesData';
import { audioManager } from '../engine/audioManager';
import { spawnFoodParticles, updateFoodParticles } from '../engine/foodPhysics';
import { updateFishBehaviors } from '../engine/fishPhysics';
import { stepWaterSimulation } from '../engine/waterSimulation';

const STORAGE_KEY = 'pd_acqua_world_saved_tanks_v1';
const ACTIVE_TANK_KEY = 'pd_acqua_world_active_tank_v1';

export type ActivePanel =
  | 'feed'
  | 'lighting'
  | 'tank_builder'
  | 'species'
  | 'equipment'
  | 'aquascape'
  | 'save_manager'
  | null;

export interface AquariumState {
  currentTank: TankConfig;
  savedTanks: TankConfig[];
  selectedFishId: string | null;
  activePanel: ActivePanel;
  isWatchMode: boolean;
  isAudioMuted: boolean;
  lowEffectsMode: boolean;
  statusMessage: string | null;

  // Real-time dynamic simulation lists
  foodParticles: FoodParticle[];
  bubbles: Bubble[];
  ripples: SurfaceRipple[];

  // Feed tool configuration
  feedConfig: {
    type: FoodType;
    portion: FoodPortion;
    size: FoodParticleSize;
    color: string;
  };

  // Aquascaping undo history
  decorHistory: DecorItem[][];

  // Actions
  setActivePanel: (panel: ActivePanel) => void;
  toggleWatchMode: (val?: boolean) => void;
  toggleAudio: () => void;
  setLowEffectsMode: (val: boolean) => void;
  setSelectedFishId: (id: string | null) => void;
  setStatusMessage: (msg: string | null) => void;

  setFeedConfig: (partial: Partial<AquariumState['feedConfig']>) => void;
  dropFood: (normX: number, normY: number) => void;
  removeLeftovers: () => void;

  updateTank: (partial: Partial<TankConfig>) => void;
  setTankShape: (shape: TankShape) => void;
  updateEquipment: (partial: Partial<EquipmentState>) => void;
  updateLighting: (partial: Partial<LightingState>) => void;

  addFish: (speciesId: string, quantity: number, customName?: string) => void;
  removeFish: (fishId: string) => void;
  renameFish: (fishId: string, newName: string) => void;

  addDecor: (type: DecorItem['type'], name: string) => void;
  updateDecor: (id: string, partial: Partial<DecorItem>) => void;
  removeDecor: (id: string) => void;
  undoDecor: () => void;

  // Preset & Saved Tank actions
  loadPreset: (presetName: 'blue_fin' | 'tropical' | 'shrimp' | 'reef' | 'empty') => void;
  saveCurrentTank: (customName?: string) => void;
  loadSavedTank: (tankId: string) => void;
  duplicateSavedTank: (tankId: string) => void;
  deleteSavedTank: (tankId: string) => void;

  // Simulation tick (called on requestAnimationFrame)
  tickSimulation: (dtSeconds: number, timeSec: number) => void;
}

function loadInitialTanks(): { active: TankConfig; saved: TankConfig[] } {
  let saved: TankConfig[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      saved = JSON.parse(raw);
    }
  } catch {
    saved = [];
  }

  let active: TankConfig | null = null;
  try {
    const rawActive = localStorage.getItem(ACTIVE_TANK_KEY);
    if (rawActive) {
      active = JSON.parse(rawActive);
    }
  } catch {
    active = null;
  }

  if (!active) {
    active = createBlueFinsHome();
  }

  return { active, saved };
}

const { active: initialActiveTank, saved: initialSavedTanks } = loadInitialTanks();

export const useAquariumStore = create<AquariumState>((set, get) => ({
  currentTank: initialActiveTank,
  savedTanks: initialSavedTanks,
  selectedFishId: null,
  activePanel: null,
  isWatchMode: false,
  isAudioMuted: true,
  lowEffectsMode: false,
  statusMessage: null,

  foodParticles: [],
  bubbles: [],
  ripples: [],

  feedConfig: {
    type: 'pellets',
    portion: 'pinch',
    size: 'medium',
    color: '#f97316' // Vibrant Orange by default
  },

  decorHistory: [],

  setActivePanel: (panel) => {
    set({ activePanel: panel });
  },

  toggleWatchMode: (val) => {
    set(state => ({
      isWatchMode: val !== undefined ? val : !state.isWatchMode,
      activePanel: null
    }));
  },

  toggleAudio: () => {
    const nextMuted = !get().isAudioMuted;
    audioManager.setMuted(nextMuted);
    set({ isAudioMuted: nextMuted });
  },

  setLowEffectsMode: (val) => set({ lowEffectsMode: val }),

  setSelectedFishId: (id) => set({ selectedFishId: id }),

  setStatusMessage: (msg) => set({ statusMessage: msg }),

  setFeedConfig: (partial) => {
    set(state => ({
      feedConfig: { ...state.feedConfig, ...partial }
    }));
  },

  dropFood: (normX, normY) => {
    const { feedConfig, currentTank, ripples, foodParticles } = get();
    audioManager.playFoodDrop();

    // Spawn ripples
    const newRipple: SurfaceRipple = {
      id: `ripple-${Date.now()}`,
      x: normX,
      y: 1.0 - (currentTank.waterLevelPercent / 100),
      radius: 4,
      maxRadius: 28,
      strength: 1.0,
      age: 0
    };

    const newParticles = spawnFoodParticles(
      {
        x: normX,
        y: normY,
        type: feedConfig.type,
        portion: feedConfig.portion,
        size: feedConfig.size,
        color: feedConfig.color
      },
      currentTank.waterLevelPercent
    );

    set({
      foodParticles: [...foodParticles, ...newParticles],
      ripples: [...ripples, newRipple]
    });
  },

  removeLeftovers: () => {
    const { foodParticles, currentTank } = get();
    // Clear resting food and restore pristine clarity
    const cleaned = foodParticles.filter(p => p.floatState !== 'rest');
    const updatedTank = {
      ...currentTank,
      leftoversCount: 0,
      clarityPercent: 99
    };
    set({
      foodParticles: cleaned,
      currentTank: updatedTank,
      statusMessage: 'Substrate gravel siphoned: leftovers removed and water clarity restored.'
    });
  },

  updateTank: (partial) => {
    set(state => {
      const updated = { ...state.currentTank, ...partial, updatedAt: Date.now() };
      try {
        localStorage.setItem(ACTIVE_TANK_KEY, JSON.stringify(updated));
      } catch {}
      return { currentTank: updated };
    });
  },

  setTankShape: (shape) => {
    get().updateTank({ shape });
  },

  updateEquipment: (partial) => {
    const { currentTank } = get();
    const updatedEq = { ...currentTank.equipment, ...partial };
    audioManager.updateEquipmentAudio(
      updatedEq.filterEnabled,
      updatedEq.filterFlowStrength,
      updatedEq.aerationEnabled,
      updatedEq.aerationStrength
    );
    get().updateTank({ equipment: updatedEq });
  },

  updateLighting: (partial) => {
    const { currentTank } = get();
    get().updateTank({ lighting: { ...currentTank.lighting, ...partial } });
  },

  addFish: (speciesId, quantity, customName) => {
    const { currentTank } = get();
    const spec = getSpeciesById(speciesId);
    if (!spec) return;

    const newFishList: FishInstance[] = [];
    for (let i = 0; i < quantity; i++) {
      const name = customName && quantity === 1
        ? customName
        : `${spec.commonName.split(' ')[0]} #${currentTank.inhabitants.length + i + 1}`;

      newFishList.push({
        id: `fish-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        speciesId,
        name,
        x: 0.25 + Math.random() * 0.5,
        y: 0.3 + Math.random() * 0.4,
        vx: 0.0005 * (Math.random() > 0.5 ? 1 : -1),
        vy: 0,
        heading: Math.random() * Math.PI * 2,
        targetHeading: Math.random() * Math.PI * 2,
        speed: 0.0005,
        baseSpeed: 0.0005,
        bodyFlex: 0,
        tailPhase: Math.random() * Math.PI * 2,
        behavior: spec.socialBehavior === 'schooling' ? 'schooling' : 'cruising',
        targetFoodId: null,
        stateTimer: 60,
        hunger: 35,
        health: 100,
        depthZ: 0.3 + Math.random() * 0.4
      });
    }

    get().updateTank({
      inhabitants: [...currentTank.inhabitants, ...newFishList]
    });
    set({ statusMessage: `Added ${quantity} × ${spec.commonName} to the aquarium.` });
  },

  removeFish: (fishId) => {
    const { currentTank } = get();
    get().updateTank({
      inhabitants: currentTank.inhabitants.filter(f => f.id !== fishId)
    });
    set({ selectedFishId: null });
  },

  renameFish: (fishId, newName) => {
    const { currentTank } = get();
    get().updateTank({
      inhabitants: currentTank.inhabitants.map(f => f.id === fishId ? { ...f, name: newName } : f)
    });
  },

  addDecor: (type, name) => {
    const { currentTank, decorHistory } = get();
    const newItem: DecorItem = {
      id: `decor-${Date.now()}`,
      type,
      name,
      x: 0.3 + Math.random() * 0.4,
      y: 0.72,
      scale: 1.0,
      rotation: 0,
      flipped: false,
      depthZone: 'mid'
    };
    set({ decorHistory: [...decorHistory, currentTank.decor] });
    get().updateTank({ decor: [...currentTank.decor, newItem] });
  },

  updateDecor: (id, partial) => {
    const { currentTank } = get();
    get().updateTank({
      decor: currentTank.decor.map(d => d.id === id ? { ...d, ...partial } : d)
    });
  },

  removeDecor: (id) => {
    const { currentTank, decorHistory } = get();
    set({ decorHistory: [...decorHistory, currentTank.decor] });
    get().updateTank({
      decor: currentTank.decor.filter(d => d.id !== id)
    });
  },

  undoDecor: () => {
    const { decorHistory } = get();
    if (decorHistory.length === 0) return;
    const prev = decorHistory[decorHistory.length - 1];
    set({ decorHistory: decorHistory.slice(0, -1) });
    get().updateTank({ decor: prev });
  },

  loadPreset: (presetName) => {
    let preset: TankConfig;
    if (presetName === 'blue_fin') preset = createBlueFinsHome();
    else if (presetName === 'tropical') preset = createTropicalCommunityPreset();
    else if (presetName === 'shrimp') preset = createPlantedShrimpPreset();
    else if (presetName === 'reef') preset = createMarineReefPreset();
    else preset = createEmptyCustomTank();

    set({
      currentTank: preset,
      foodParticles: [],
      bubbles: [],
      ripples: [],
      selectedFishId: null,
      activePanel: null,
      statusMessage: `Loaded preset: ${preset.name}`
    });
    try {
      localStorage.setItem(ACTIVE_TANK_KEY, JSON.stringify(preset));
    } catch {}
  },

  saveCurrentTank: (customName) => {
    const { currentTank, savedTanks } = get();
    const name = customName?.trim() || currentTank.name;
    const toSave: TankConfig = {
      ...currentTank,
      name,
      updatedAt: Date.now()
    };

    const existingIdx = savedTanks.findIndex(t => t.id === toSave.id);
    let updatedList: TankConfig[];
    if (existingIdx >= 0) {
      updatedList = [...savedTanks];
      updatedList[existingIdx] = toSave;
    } else {
      updatedList = [...savedTanks, toSave];
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      localStorage.setItem(ACTIVE_TANK_KEY, JSON.stringify(toSave));
    } catch {}

    set({
      currentTank: toSave,
      savedTanks: updatedList,
      statusMessage: `Tank "${name}" saved locally!`
    });
  },

  loadSavedTank: (tankId) => {
    const { savedTanks } = get();
    const target = savedTanks.find(t => t.id === tankId);
    if (!target) return;

    set({
      currentTank: target,
      foodParticles: [],
      bubbles: [],
      ripples: [],
      selectedFishId: null,
      activePanel: null,
      statusMessage: `Reopened saved aquarium: ${target.name}`
    });
    try {
      localStorage.setItem(ACTIVE_TANK_KEY, JSON.stringify(target));
    } catch {}
  },

  duplicateSavedTank: (tankId) => {
    const { savedTanks } = get();
    const target = savedTanks.find(t => t.id === tankId);
    if (!target) return;

    const copy: TankConfig = {
      ...target,
      id: `tank-${Date.now()}`,
      name: `${target.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updatedList = [...savedTanks, copy];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch {}

    set({
      savedTanks: updatedList,
      statusMessage: `Duplicated aquarium as "${copy.name}".`
    });
  },

  deleteSavedTank: (tankId) => {
    const { savedTanks } = get();
    const updated = savedTanks.filter(t => t.id !== tankId);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    set({
      savedTanks: updated,
      statusMessage: 'Saved tank removed.'
    });
  },

  tickSimulation: (dtSeconds, timeSec) => {
    const state = get();
    const { currentTank, foodParticles, bubbles, ripples } = state;

    // Check if simulation is paused (simSpeed === 0)
    const isPaused = currentTank.equipment.simSpeed === 0;
    if (isPaused) return;

    const dt = dtSeconds * currentTank.equipment.simSpeed;

    // 1. Water Quality & Thermal simulation
    const waterSim = stepWaterSimulation(currentTank, dtSeconds, currentTank.leftoversCount);

    // 2. Food particle physics
    const { updatedParticles, newLeftovers } = updateFoodParticles(
      foodParticles,
      dt,
      currentTank.equipment.filterFlowStrength,
      currentTank.waterLevelPercent,
      currentTank.shape
    );

    // 3. Fish behaviors & AI
    const fishSim = updateFishBehaviors(currentTank.inhabitants, {
      dt,
      shape: currentTank.shape,
      waterLevelPercent: currentTank.waterLevelPercent,
      decor: currentTank.decor,
      foodParticles: updatedParticles,
      flowStrength: currentTank.equipment.filterFlowStrength,
      allFish: currentTank.inhabitants,
      lightingPreset: currentTank.lighting.preset
    });

    // Remove eaten food particles
    const survivingFood = updatedParticles.filter(p => !fishSim.eatenFoodIds.includes(p.id));

    // 4. Aeration bubbles generation
    let currentBubbles = [...bubbles, ...fishSim.newBubbles];
    const waterTop = 1.0 - (currentTank.waterLevelPercent / 100);

    // Spawn bubbles from airstone if enabled
    if (currentTank.equipment.aerationEnabled && Math.random() < 0.4 * currentTank.equipment.aerationStrength) {
      const airStone = currentTank.decor.find(d => d.type === 'airstone');
      const airX = airStone ? airStone.x : 0.88;
      const airY = airStone ? airStone.y : 0.82;

      currentBubbles.push({
        id: `bubble-air-${Date.now()}-${Math.random()}`,
        x: airX + (Math.random() - 0.5) * 0.03,
        y: airY - 0.02,
        radius: 1.5 + Math.random() * 2.5,
        vy: 0.0012 + Math.random() * 0.0008,
        vx: (Math.random() - 0.5) * 0.0003,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 4 + Math.random() * 2,
        source: 'airstone'
      });
    }

    // Update bubbles: rise and pop at surface
    const updatedBubbles: Bubble[] = [];
    for (const b of currentBubbles) {
      b.y -= b.vy * dt * 60;
      b.wobblePhase += dt * b.wobbleSpeed;
      b.x += Math.sin(b.wobblePhase) * 0.0004;

      if (b.y > waterTop + 0.01) {
        updatedBubbles.push(b);
      }
    }

    // 5. Update surface ripples
    const updatedRipples: SurfaceRipple[] = [];
    for (const r of ripples) {
      r.age += dt;
      r.radius += dt * 35;
      r.strength = Math.max(0, 1.0 - (r.radius / r.maxRadius));
      if (r.strength > 0.05) {
        updatedRipples.push(r);
      }
    }

    // 6. Day/Night automatic cycle
    let nextLighting = currentTank.lighting;
    if (currentTank.lighting.autoCycle) {
      const cycleHours = (currentTank.lighting.manualClockHours + dt * 0.1) % 24;
      let nextPreset = currentTank.lighting.preset;
      if (cycleHours >= 5 && cycleHours < 8) nextPreset = 'dawn';
      else if (cycleHours >= 8 && cycleHours < 12) nextPreset = 'morning';
      else if (cycleHours >= 12 && cycleHours < 18) nextPreset = 'afternoon';
      else if (cycleHours >= 18 && cycleHours < 21) nextPreset = 'dusk';
      else if (cycleHours >= 21 && cycleHours < 23) nextPreset = 'night';
      else if (cycleHours >= 23 || cycleHours < 4) nextPreset = 'midnight';
      else nextPreset = 'dawn';

      nextLighting = {
        ...currentTank.lighting,
        manualClockHours: cycleHours,
        preset: nextPreset
      };
    }

    set({
      currentTank: {
        ...currentTank,
        equipment: waterSim.updatedEquipment,
        leftoversCount: currentTank.leftoversCount + newLeftovers,
        clarityPercent: waterSim.updatedClarityPercent,
        inhabitants: fishSim.updatedFish,
        lighting: nextLighting
      },
      foodParticles: survivingFood,
      bubbles: updatedBubbles,
      ripples: updatedRipples
    });
  }
}));
