import {
  FishInstance,
  FoodParticle,
  DecorItem,
  TankShape,
  Bubble
} from '../types';
import { getSpeciesById } from '../data/speciesData';
import { isInsideTank, getHabitatBounds } from '../utils/tankGeometry';
import { audioManager } from './audioManager';

export interface FishUpdateContext {
  dt: number; // delta time in seconds
  shape: TankShape;
  waterLevelPercent: number;
  decor: DecorItem[];
  foodParticles: FoodParticle[];
  flowStrength: number;
  allFish: FishInstance[];
  lightingPreset: string;
}

export interface FishUpdateOutput {
  updatedFish: FishInstance[];
  eatenFoodIds: string[];
  newBubbles: Bubble[];
}

export function updateFishBehaviors(
  fishList: FishInstance[],
  ctx: FishUpdateContext
): FishUpdateOutput {
  const { dt, shape, waterLevelPercent, decor, foodParticles, flowStrength, lightingPreset } = ctx;
  const eatenFoodIds: string[] = [];
  const newBubbles: Bubble[] = [];
  const waterTop = 1.0 - (waterLevelPercent / 100);
  const bounds = getHabitatBounds(shape, waterLevelPercent);

  // Group fish by schooling species
  const schoolingGroups: Record<string, FishInstance[]> = {};
  for (const f of fishList) {
    const sp = getSpeciesById(f.speciesId);
    if (sp?.socialBehavior === 'schooling') {
      if (!schoolingGroups[f.speciesId]) schoolingGroups[f.speciesId] = [];
      schoolingGroups[f.speciesId].push(f);
    }
  }

  const updatedFish = fishList.map(fish => {
    const sp = getSpeciesById(fish.speciesId);
    const f: FishInstance = { ...fish };

    // Update timers
    f.stateTimer -= dt;
    f.tailPhase += dt * (f.speed * 8000 + 4);

    // Increase hunger slowly over time (up to 100)
    f.hunger = Math.min(100, f.hunger + dt * 0.15);

    // Zone target Y
    let preferredY = 0.5;
    if (sp?.preferredZone === 'surface') preferredY = waterTop + 0.1;
    else if (sp?.preferredZone === 'bottom') preferredY = 0.86;
    else preferredY = waterTop + (0.9 - waterTop) * 0.5;

    // Check food targeting
    const isHungry = f.hunger > 18;
    const canEat = f.behavior !== 'eating';

    if (isHungry && canEat && foodParticles.length > 0) {
      // Find nearest suitable food particle
      let nearestDist = 999;
      let targetId: string | null = null;
      let targetFood: FoodParticle | null = null;

      for (const food of foodParticles) {
        if (food.eaten) continue;
        // Bottom feeders prioritize food resting on bottom
        if (sp?.preferredZone === 'bottom' && food.floatState === 'floating') continue;
        // Surface feeders prioritize food at surface or mid
        if (sp?.preferredZone === 'surface' && food.floatState === 'rest' && f.speciesId !== 'panda_cory') continue;

        const dx = food.x - f.x;
        const dy = food.y - f.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Sensory radius: ~0.45 relative units
        if (dist < 0.45 && dist < nearestDist) {
          nearestDist = dist;
          targetId = food.id;
          targetFood = food;
        }
      }

      if (targetId && targetFood) {
        f.targetFoodId = targetId;
        f.behavior = 'approaching_food';
        f.targetHeading = Math.atan2(targetFood.y - f.y, targetFood.x - f.x);
        f.speed = f.baseSpeed * 1.8;

        // Check if within eating reach (distance < 0.035)
        if (nearestDist < 0.035) {
          f.behavior = 'eating';
          f.stateTimer = 1.2; // chewing duration
          f.hunger = Math.max(0, f.hunger - 35);
          f.speed = f.baseSpeed * 0.2;
          audioManager.playBite();
          if (!eatenFoodIds.includes(targetId)) {
            eatenFoodIds.push(targetId);
          }
        }
      }
    }

    // STATE MACHINE TRANSITIONS
    if (f.behavior === 'eating') {
      if (f.stateTimer <= 0) {
        f.behavior = 'cruising';
        f.targetFoodId = null;
        f.stateTimer = 4 + Math.random() * 4;
      }
    } else if (f.behavior === 'rising_for_air') {
      // Betta surfacing to breathe
      f.targetHeading = -Math.PI / 2; // swim upward
      f.speed = f.baseSpeed * 1.4;
      if (f.y <= waterTop + 0.035) {
        // Reached surface: gulp air!
        f.y = waterTop + 0.035;
        f.speed = 0;
        if (f.stateTimer <= 0) {
          // Release tiny breath bubble
          newBubbles.push({
            id: `bubble-breath-${Date.now()}-${Math.random()}`,
            x: f.x + (Math.cos(f.heading) * 0.02),
            y: waterTop + 0.01,
            radius: 2 + Math.random() * 2,
            vy: 0.0006,
            vx: (Math.random() - 0.5) * 0.0002,
            wobblePhase: 0,
            wobbleSpeed: 4,
            source: 'fish_breath'
          });
          audioManager.playBubblePop();
          f.behavior = 'cruising';
          f.targetHeading = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
          f.stateTimer = 8 + Math.random() * 10;
        }
      }
    } else if (f.behavior === 'resting') {
      f.speed = f.baseSpeed * 0.15;
      if (f.stateTimer <= 0) {
        f.behavior = 'cruising';
        f.stateTimer = 6 + Math.random() * 8;
      }
    } else if (f.behavior === 'grazing') {
      // Shrimp & Corydoras grazing
      f.speed = f.baseSpeed * 0.3;
      if (f.stateTimer <= 0) {
        f.behavior = Math.random() > 0.4 ? 'grazing' : 'exploring';
        f.stateTimer = 3 + Math.random() * 5;
        f.targetHeading = (Math.random() - 0.5) * Math.PI;
      }
    } else if (f.behavior === 'schooling' && sp?.socialBehavior === 'schooling') {
      // Schooling boids calculation
      const group = schoolingGroups[f.speciesId] || [];
      if (group.length > 1) {
        let avgX = 0, avgY = 0;
        let avgVx = 0, avgVy = 0;
        let sepX = 0, sepY = 0;
        let count = 0;

        for (const other of group) {
          if (other.id === f.id) continue;
          const dx = other.x - f.x;
          const dy = other.y - f.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 0.25) {
            avgX += other.x;
            avgY += other.y;
            avgVx += Math.cos(other.heading);
            avgVy += Math.sin(other.heading);
            count++;

            // Separation (too close)
            if (dist < 0.045 && dist > 0.0001) {
              sepX -= (dx / dist) * (0.045 - dist);
              sepY -= (dy / dist) * (0.045 - dist);
            }
          }
        }

        if (count > 0) {
          avgX /= count;
          avgY /= count;
          avgVx /= count;
          avgVy /= count;

          // Cohesion vector
          const cohHeading = Math.atan2(avgY - f.y, avgX - f.x);
          // Alignment vector
          const alignHeading = Math.atan2(avgVy, avgVx);

          let combinedHeading = alignHeading * 0.5 + cohHeading * 0.3;
          if (sepX !== 0 || sepY !== 0) {
            const sepHeading = Math.atan2(sepY, sepX);
            combinedHeading = sepHeading * 0.6 + combinedHeading * 0.4;
          }
          f.targetHeading = combinedHeading;
          f.speed = f.baseSpeed * (0.9 + Math.random() * 0.2);
        }
      }
    } else {
      // Default / Cruising / Exploring
      if (f.stateTimer <= 0) {
        f.stateTimer = 4 + Math.random() * 6;

        // Species-specific state chance:
        if (f.speciesId === 'betta') {
          // Betta periodically rests under leaf or surfaces for air
          const roll = Math.random();
          if (roll < 0.25) {
            f.behavior = 'rising_for_air';
            f.stateTimer = 1.5; // breath duration
          } else if (roll < 0.5) {
            f.behavior = 'resting';
            f.stateTimer = 5 + Math.random() * 6;
          } else {
            f.behavior = 'cruising';
            f.targetHeading = (Math.random() - 0.5) * Math.PI;
          }
        } else if (f.speciesId === 'panda_cory' || f.speciesId === 'yellow_watchman_goby') {
          // Bottom dweller: rests on sand or forages
          if (Math.random() < 0.4) {
            f.behavior = 'resting';
            f.stateTimer = 4 + Math.random() * 5;
          } else {
            f.behavior = 'exploring';
            // Horizontal scuttle along bottom
            f.targetHeading = Math.random() > 0.5 ? 0 : Math.PI;
          }
        } else if (f.speciesId === 'cherry_shrimp') {
          f.behavior = 'grazing';
          f.stateTimer = 3 + Math.random() * 4;
        } else {
          // General fish cruise
          f.behavior = 'cruising';
          f.targetHeading = (Math.random() - 0.5) * Math.PI * 0.8;
          if (Math.random() > 0.5) f.targetHeading += Math.PI;
        }
      }
    }

    // Zone steering: gently steer back toward preferred swimming zone
    const zoneDiff = preferredY - f.y;
    if (Math.abs(zoneDiff) > 0.15 && f.behavior !== 'approaching_food' && f.behavior !== 'rising_for_air') {
      f.targetHeading = f.targetHeading * 0.8 + (zoneDiff > 0 ? 0.3 : -0.3) * 0.2;
    }

    // OBSTACLE AVOIDANCE: Solid decorations
    for (const d of decor) {
      if (d.type.includes('driftwood') || d.type.includes('stone') || d.type.includes('rock')) {
        const dx = f.x - d.x;
        const dy = f.y - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 0.12 * d.scale;
        if (dist < radius && dist > 0.001) {
          // Steer smoothly around obstacle
          const avoidHeading = Math.atan2(dy, dx);
          f.targetHeading = avoidHeading;
          f.speed = f.baseSpeed * 1.1;
        }
      }
    }

    // BOUNDARY AVOIDANCE: Glass and tank walls
    const margin = 0.08;
    if (f.x < bounds.minX + margin) {
      f.targetHeading = 0; // turn right
    } else if (f.x > bounds.maxX - margin) {
      f.targetHeading = Math.PI; // turn left
    }
    if (f.y < bounds.minY + margin && f.behavior !== 'rising_for_air') {
      f.targetHeading = Math.PI / 2; // swim downward
    } else if (f.y > bounds.maxY - margin) {
      f.targetHeading = -Math.PI / 2; // swim upward
    }

    // Smooth heading rotation (turn rate)
    let headingDiff = f.targetHeading - f.heading;
    while (headingDiff > Math.PI) headingDiff -= Math.PI * 2;
    while (headingDiff < -Math.PI) headingDiff += Math.PI * 2;
    const turnRate = 3.5 * dt;
    f.heading += Math.max(-turnRate, Math.min(turnRate, headingDiff));

    // Body flex is proportional to turning rate and tail oscillation
    f.bodyFlex = Math.sin(f.tailPhase) * 0.15 + (headingDiff * 0.2);

    // Filter flow influence
    const currentPushX = flowStrength * 0.00015 * dt;

    // Movement step
    f.vx = Math.cos(f.heading) * f.speed * dt * 60 + currentPushX;
    f.vy = Math.sin(f.heading) * f.speed * dt * 60;

    f.x += f.vx;
    f.y += f.vy;

    // Strictly clamp inside tank shape
    if (!isInsideTank(f.x, f.y, shape, waterLevelPercent)) {
      f.x = Math.max(bounds.minX, Math.min(bounds.maxX, f.x));
      f.y = Math.max(bounds.minY, Math.min(bounds.maxY, f.y));
      f.targetHeading += Math.PI * 0.8;
    }

    return f;
  });

  return {
    updatedFish,
    eatenFoodIds,
    newBubbles
  };
}
