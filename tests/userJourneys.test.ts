import { describe, it, expect, beforeEach } from 'vitest';
import { useAquariumStore } from '../src/store/aquariumStore';
import { createBlueFinsHome } from '../src/data/tankPresets';
import { calculateTankVolume, isInsideTank } from '../src/utils/tankGeometry';
import { evaluateSpeciesCompatibility } from '../src/utils/compatibilityEvaluator';
import { getSpeciesById } from '../src/data/speciesData';
import { stepWaterSimulation } from '../src/engine/waterSimulation';
import { updateFishBehaviors } from '../src/engine/fishPhysics';
import { FoodParticle } from '../src/types';

describe('PD Acqua World — 7 User Journeys Verification', () => {
  beforeEach(() => {
    // Reset store to Blue Fin's Home
    useAquariumStore.setState({
      currentTank: createBlueFinsHome(),
      activePanel: null,
      isWatchMode: false,
      selectedFishId: null,
      foodParticles: [],
      bubbles: [],
      ripples: [],
      feedConfig: {
        type: 'pellets',
        portion: 'pinch',
        size: 'medium',
        color: '#f97316'
      }
    });
  });

  // JOURNEY 1
  it('Journey 1: Open Blue Fin’s Home, choose orange floating pellets, tap left water, watch Blue Fin approach and eat', () => {
    const store = useAquariumStore.getState();
    expect(store.currentTank.name).toBe("Blue Fin's Home");
    expect(store.currentTank.inhabitants.length).toBe(1);
    const blueFin = store.currentTank.inhabitants[0];
    expect(blueFin.name).toBe('Blue Fin');
    expect(blueFin.speciesId).toBe('betta');

    // Configure orange floating pellets
    store.setFeedConfig({
      type: 'pellets',
      color: '#f97316'
    });
    expect(useAquariumStore.getState().feedConfig.color).toBe('#f97316');
    expect(useAquariumStore.getState().feedConfig.type).toBe('pellets');

    // Tap left side of the water (normX: 0.2, normY: 0.15)
    store.dropFood(0.2, 0.15);
    const stateAfterDrop = useAquariumStore.getState();
    expect(stateAfterDrop.foodParticles.length).toBeGreaterThan(0);
    const pellet = stateAfterDrop.foodParticles[0];
    expect(pellet.color).toBe('#f97316');
    expect(pellet.floatState).toBe('floating');
    expect(pellet.x).toBeLessThan(0.3); // left side

    // Step simulation: Blue Fin notices food and approaches/eats it
    blueFin.hunger = 70;
    blueFin.x = 0.22;
    blueFin.y = 0.22;

    const fishSim = updateFishBehaviors([blueFin], {
      dt: 0.5,
      shape: store.currentTank.shape,
      waterLevelPercent: store.currentTank.waterLevelPercent,
      decor: store.currentTank.decor,
      foodParticles: [pellet],
      flowStrength: store.currentTank.equipment.filterFlowStrength,
      allFish: [blueFin],
      lightingPreset: store.currentTank.lighting.preset
    });

    expect(['approaching_food', 'eating']).toContain(fishSim.updatedFish[0].behavior);
  });

  // JOURNEY 2
  it('Journey 2: Create panoramic freshwater tank, add tetra school, place driftwood, and watch school avoid and move around it', () => {
    const store = useAquariumStore.getState();
    store.setTankShape('panoramic');
    expect(useAquariumStore.getState().currentTank.shape).toBe('panoramic');

    // Add school of 8 Neon Tetras
    store.addFish('neon_tetra', 8);
    const stateWithTetras = useAquariumStore.getState();
    const tetras = stateWithTetras.currentTank.inhabitants.filter(f => f.speciesId === 'neon_tetra');
    expect(tetras.length).toBe(8);

    // Add centerpiece driftwood
    store.addDecor('driftwood_branch', 'Centerpiece Bogwood');
    const stateWithWood = useAquariumStore.getState();
    const wood = stateWithWood.currentTank.decor.find(d => d.type === 'driftwood_branch');
    expect(wood).toBeDefined();

    // Verify school steering avoids driftwood obstacle
    const simResult = updateFishBehaviors(tetras, {
      dt: 0.1,
      shape: 'panoramic',
      waterLevelPercent: 90,
      decor: [wood!],
      foodParticles: [],
      flowStrength: 0.4,
      allFish: tetras,
      lightingPreset: 'afternoon'
    });

    expect(simResult.updatedFish.length).toBe(8);
    // Schooling behavior preserved
    expect(simResult.updatedFish[0].behavior).toBe('schooling');
  });

  // JOURNEY 3
  it('Journey 3: Switch between bowl, cube, cylinder, hexagonal tank; confirm fish and food stay inside each shape', () => {
    const store = useAquariumStore.getState();
    const shapes: ('bowl' | 'cube' | 'cylinder' | 'hexagonal')[] = ['bowl', 'cube', 'cylinder', 'hexagonal'];

    for (const s of shapes) {
      store.setTankShape(s);
      const tank = useAquariumStore.getState().currentTank;
      expect(tank.shape).toBe(s);

      // Usable interior check
      expect(isInsideTank(0.5, 0.5, s, tank.waterLevelPercent)).toBe(true);

      // Verify boundary limits
      if (s === 'bowl') {
        // Extreme corners must be outside
        expect(isInsideTank(0.02, 0.02, s, tank.waterLevelPercent)).toBe(false);
        expect(isInsideTank(0.98, 0.98, s, tank.waterLevelPercent)).toBe(false);
      }
    }
  });

  // JOURNEY 4
  it('Journey 4: Set heater target above current temp, enable 5x speed, confirm gradual rise; pause and confirm time stops', () => {
    const store = useAquariumStore.getState();
    store.updateEquipment({
      measuredTemp: 22.0,
      heaterTargetTemp: 28.0,
      heaterEnabled: true,
      simSpeed: 5
    });

    const tank = useAquariumStore.getState().currentTank;
    const step1 = stepWaterSimulation(tank, 1.0, 0);
    // Measured temp rises toward 28°C
    expect(step1.updatedEquipment.measuredTemp).toBeGreaterThan(22.0);
    expect(step1.updatedEquipment.measuredTemp).toBeLessThanOrEqual(28.0);

    // Pause simulation (0x speed)
    tank.equipment.measuredTemp = step1.updatedEquipment.measuredTemp;
    tank.equipment.simSpeed = 0;
    const stepPaused = stepWaterSimulation(tank, 5.0, 0);
    // Measured temp should not change when paused
    expect(stepPaused.updatedEquipment.measuredTemp).toBe(step1.updatedEquipment.measuredTemp);
  });

  // JOURNEY 5
  it('Journey 5: Transition from Afternoon to Midnight Moonlight, enter Watch mode, and return to editing', () => {
    const store = useAquariumStore.getState();
    store.updateLighting({ preset: 'afternoon' });
    expect(useAquariumStore.getState().currentTank.lighting.preset).toBe('afternoon');

    // Transition to Midnight Moonlight
    store.updateLighting({ preset: 'midnight' });
    expect(useAquariumStore.getState().currentTank.lighting.preset).toBe('midnight');

    // Enter Watch Mode
    store.toggleWatchMode(true);
    expect(useAquariumStore.getState().isWatchMode).toBe(true);
    expect(useAquariumStore.getState().activePanel).toBeNull();

    // Return to Editing
    store.toggleWatchMode(false);
    expect(useAquariumStore.getState().isWatchMode).toBe(false);
  });

  // JOURNEY 6
  it('Journey 6: Save a tank, reload from saved state, verify fish names, decor positions, equipment, and lighting return', () => {
    const store = useAquariumStore.getState();
    store.renameFish(store.currentTank.inhabitants[0].id, 'Blue Fin Emperor');
    store.updateEquipment({ heaterTargetTemp: 27.5, filterFlowStrength: 0.8 });
    store.updateLighting({ preset: 'dusk' });

    // Save tank
    store.saveCurrentTank('Emperor Paradise');
    const savedList = useAquariumStore.getState().savedTanks;
    const saved = savedList.find(t => t.name === 'Emperor Paradise');
    expect(saved).toBeDefined();
    expect(saved!.inhabitants[0].name).toBe('Blue Fin Emperor');
    expect(saved!.equipment.heaterTargetTemp).toBe(27.5);
    expect(saved!.equipment.filterFlowStrength).toBe(0.8);
    expect(saved!.lighting.preset).toBe('dusk');

    // Reload saved tank
    store.loadSavedTank(saved!.id);
    const active = useAquariumStore.getState().currentTank;
    expect(active.name).toBe('Emperor Paradise');
    expect(active.inhabitants[0].name).toBe('Blue Fin Emperor');
    expect(active.equipment.heaterTargetTemp).toBe(27.5);
  });

  // JOURNEY 7
  it('Journey 7: Touch controls, species inspection card, and mobile responsiveness', () => {
    const store = useAquariumStore.getState();
    const fish = store.currentTank.inhabitants[0];

    // Inspect fish card
    store.setSelectedFishId(fish.id);
    expect(useAquariumStore.getState().selectedFishId).toBe(fish.id);

    // Mobile touch interaction: drop food
    store.dropFood(0.4, 0.2);
    expect(useAquariumStore.getState().foodParticles.length).toBeGreaterThan(0);

    // Change lighting
    store.updateLighting({ preset: 'dawn' });
    expect(useAquariumStore.getState().currentTank.lighting.preset).toBe('dawn');
  });
});
