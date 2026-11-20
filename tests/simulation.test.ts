import { describe, it, expect } from 'vitest';
import { stepWaterSimulation } from '../src/engine/waterSimulation';
import { updateFishBehaviors } from '../src/engine/fishPhysics';
import { spawnFoodParticles, updateFoodParticles } from '../src/engine/foodPhysics';
import { createBlueFinsHome } from '../src/data/tankPresets';
import { FoodParticle } from '../src/types';

describe('Water Simulation & Physics Engine', () => {
  it('gradually adjusts measured temperature toward heater target', () => {
    const tank = createBlueFinsHome();
    tank.equipment.measuredTemp = 24.0;
    tank.equipment.heaterTargetTemp = 28.0;
    tank.equipment.heaterEnabled = true;
    tank.equipment.simSpeed = 1;

    const res1 = stepWaterSimulation(tank, 1.0, 0);
    expect(res1.updatedEquipment.measuredTemp).toBeGreaterThan(24.0);
    expect(res1.updatedEquipment.measuredTemp).toBeLessThanOrEqual(28.0);
  });

  it('drifts toward room temperature when heater is disabled', () => {
    const tank = createBlueFinsHome();
    tank.equipment.measuredTemp = 26.0;
    tank.equipment.roomTemp = 21.0;
    tank.equipment.heaterEnabled = false;
    tank.equipment.simSpeed = 1;

    const res = stepWaterSimulation(tank, 2.0, 0);
    expect(res.updatedEquipment.measuredTemp).toBeLessThan(26.0);
    expect(res.updatedEquipment.measuredTemp).toBeGreaterThanOrEqual(21.0);
  });

  it('stops simulation progress when speed is 0 (paused)', () => {
    const tank = createBlueFinsHome();
    tank.equipment.measuredTemp = 24.0;
    tank.equipment.heaterTargetTemp = 28.0;
    tank.equipment.simSpeed = 0;

    const res = stepWaterSimulation(tank, 5.0, 0);
    expect(res.updatedEquipment.measuredTemp).toBe(24.0);
  });

  it('accelerates thermal adjustment by 5x at 5x speed', () => {
    const tank1 = createBlueFinsHome();
    tank1.equipment.measuredTemp = 20.0;
    tank1.equipment.heaterTargetTemp = 30.0;
    tank1.equipment.simSpeed = 1;

    const tank5 = createBlueFinsHome();
    tank5.equipment.measuredTemp = 20.0;
    tank5.equipment.heaterTargetTemp = 30.0;
    tank5.equipment.simSpeed = 5;

    const res1 = stepWaterSimulation(tank1, 1.0, 0);
    const res5 = stepWaterSimulation(tank5, 1.0, 0);

    const delta1 = res1.updatedEquipment.measuredTemp - 20.0;
    const delta5 = res5.updatedEquipment.measuredTemp - 20.0;
    expect(delta5).toBeGreaterThan(delta1 * 3);
  });

  it('spawns food with preserved color and proper float dynamics', () => {
    const orangePellets = spawnFoodParticles({
      x: 0.3,
      y: 0.2,
      type: 'pellets',
      portion: 'pinch',
      size: 'medium',
      color: '#f97316'
    }, 90);

    expect(orangePellets.length).toBe(3);
    expect(orangePellets[0].color).toBe('#f97316');
    expect(orangePellets[0].floatState).toBe('floating');
  });

  it('lets hungry fish target food, approach it, and eat', () => {
    const tank = createBlueFinsHome();
    const fish = tank.inhabitants[0];
    fish.hunger = 80; // very hungry
    fish.x = 0.3;
    fish.y = 0.3;

    const food: FoodParticle = {
      id: 'test-food-1',
      x: 0.31,
      y: 0.31,
      vx: 0,
      vy: 0,
      type: 'pellets',
      size: 4,
      color: '#f97316',
      floatState: 'floating',
      wobblePhase: 0,
      decay: 0,
      eaten: false
    };

    const sim = updateFishBehaviors([fish], {
      dt: 0.1,
      shape: 'rectangular',
      waterLevelPercent: 90,
      decor: [],
      foodParticles: [food],
      flowStrength: 0.2,
      allFish: [fish],
      lightingPreset: 'afternoon'
    });

    // Fish should transition to eating or approaching_food
    expect(['approaching_food', 'eating']).toContain(sim.updatedFish[0].behavior);
  });
});
