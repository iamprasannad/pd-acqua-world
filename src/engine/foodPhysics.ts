import { FoodParticle, FoodType, FoodParticleSize, TankShape } from '../types';
import { isInsideTank } from '../utils/tankGeometry';

export interface DropFoodOptions {
  x: number; // 0..1
  y: number; // 0..1
  type: FoodType;
  portion: 'pinch' | 'medium' | 'generous';
  size: FoodParticleSize;
  color: string;
}

export function spawnFoodParticles(
  options: DropFoodOptions,
  waterLevelPercent: number = 90
): FoodParticle[] {
  const count = options.portion === 'pinch' ? 3 : options.portion === 'medium' ? 6 : 12;
  const radiusMap: Record<FoodParticleSize, number> = {
    tiny: 3,
    medium: 5,
    large: 7
  };
  const baseRadius = radiusMap[options.size];
  const particles: FoodParticle[] = [];

  const waterTop = 1.0 - (waterLevelPercent / 100);
  const startY = Math.max(waterTop + 0.02, Math.min(0.9, options.y));

  for (let i = 0; i < count; i++) {
    const spreadX = (Math.random() - 0.5) * 0.04;
    const spreadY = (Math.random() - 0.5) * 0.02;

    let vy = 0.0003;
    let floatState: FoodParticle['floatState'] = 'floating';

    if (options.type === 'pellets') {
      vy = 0; // floats on surface
      floatState = 'floating';
    } else if (options.type === 'granules') {
      vy = 0.0004 + Math.random() * 0.0003;
      floatState = 'sinking';
    } else if (options.type === 'flakes') {
      vy = 0.0002 + Math.random() * 0.0002;
      floatState = 'sinking';
    } else if (options.type === 'wafers') {
      vy = 0.0008 + Math.random() * 0.0004;
      floatState = 'sinking';
    }

    particles.push({
      id: `food-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      x: Math.max(0.08, Math.min(0.92, options.x + spreadX)),
      y: startY + spreadY,
      vx: (Math.random() - 0.5) * 0.0002,
      vy,
      type: options.type,
      size: baseRadius * (0.85 + Math.random() * 0.3),
      color: options.color,
      floatState,
      wobblePhase: Math.random() * Math.PI * 2,
      decay: 0,
      eaten: false
    });
  }

  return particles;
}

export function updateFoodParticles(
  particles: FoodParticle[],
  dt: number,
  flowStrength: number,
  waterLevelPercent: number,
  shape: TankShape
): { updatedParticles: FoodParticle[]; newLeftovers: number } {
  const waterTop = 1.0 - (waterLevelPercent / 100);
  let newLeftovers = 0;

  const updatedParticles: FoodParticle[] = [];

  for (const p of particles) {
    if (p.eaten) continue;

    const copy = { ...p };
    copy.wobblePhase += dt * 3;

    // Flow push horizontally (filter flow from right to left or circular)
    const flowVx = flowStrength * 0.0004;

    if (copy.type === 'pellets') {
      // Floating pellets stay right at the surface
      copy.y = waterTop + 0.015 + Math.sin(copy.wobblePhase) * 0.004;
      copy.x += (copy.vx + flowVx) * dt;
      copy.floatState = 'floating';
    } else if (copy.type === 'flakes') {
      // Flakes flutter side-to-side while gently descending
      const flutter = Math.sin(copy.wobblePhase * 2) * 0.0006;
      copy.x += (copy.vx + flowVx + flutter) * dt;
      if (copy.floatState === 'sinking') {
        copy.y += copy.vy * dt;
      }
    } else {
      // Granules & sinking wafers
      copy.x += (copy.vx + flowVx * 0.6) * dt;
      if (copy.floatState === 'sinking') {
        copy.y += copy.vy * dt;
      }
    }

    // Substrate landing
    if (copy.y >= 0.91) {
      copy.y = 0.91;
      copy.floatState = 'rest';
      copy.vx = 0;
      copy.vy = 0;
      // Decay uneaten food
      copy.decay += dt * 0.01;
      if (copy.decay >= 1.0) {
        newLeftovers++;
      }
    }

    // Tank shape boundary check
    if (!isInsideTank(copy.x, copy.y, shape, waterLevelPercent)) {
      copy.x = Math.max(0.1, Math.min(0.9, copy.x));
    }

    // Keep particles that haven't completely rotted away after very long time
    if (copy.decay < 3.0) {
      updatedParticles.push(copy);
    }
  }

  return { updatedParticles, newLeftovers };
}
