import { EquipmentState, TankConfig } from '../types';

export interface WaterSimulationResult {
  updatedEquipment: EquipmentState;
  updatedLeftoversCount: number;
  updatedClarityPercent: number;
  recentEvent?: string;
}

/**
 * Updates temperature, filtration clarity, and water quality parameters
 * based on dt (delta seconds) and simulation speed (0x, 1x, 5x).
 */
export function stepWaterSimulation(
  tank: TankConfig,
  dtSeconds: number,
  prevLeftovers: number
): WaterSimulationResult {
  const speedMultiplier = tank.equipment.simSpeed;
  if (speedMultiplier === 0 || dtSeconds <= 0) {
    return {
      updatedEquipment: { ...tank.equipment },
      updatedLeftoversCount: prevLeftovers,
      updatedClarityPercent: tank.clarityPercent
    };
  }

  const effectiveDt = dtSeconds * speedMultiplier;
  const eq = { ...tank.equipment };
  let recentEvent: string | undefined = undefined;

  // 1. Temperature Simulation
  // Target: if heater is enabled, drift toward heaterTargetTemp; otherwise drift toward roomTemp (21°C).
  const targetTemp = eq.heaterEnabled ? eq.heaterTargetTemp : eq.roomTemp;
  const tempDiff = targetTemp - eq.measuredTemp;

  if (Math.abs(tempDiff) > 0.01) {
    // Gradual thermal inertia: ~0.08°C per second at 1x
    const thermalRate = 0.08 * effectiveDt;
    const delta = Math.sign(tempDiff) * Math.min(Math.abs(tempDiff), thermalRate);
    eq.measuredTemp = Math.round((eq.measuredTemp + delta) * 100) / 100;
  } else {
    eq.measuredTemp = targetTemp;
  }

  // 2. Clarity & Leftovers Simulation
  // Each leftover uneaten particle slowly clouds water
  let clarity = tank.clarityPercent;
  let leftovers = prevLeftovers;

  if (leftovers > 0) {
    // Leftovers reduce clarity slowly over time
    const decayRate = 0.2 * effectiveDt * (leftovers / 10);
    clarity = Math.max(30, clarity - decayRate);
  }

  // Filter effect: if filter is enabled, clarity recovers towards 99%
  if (eq.filterEnabled) {
    const recoveryRate = 0.35 * (0.3 + eq.filterFlowStrength * 0.7) * effectiveDt;
    if (clarity < 99) {
      clarity = Math.min(99, clarity + recoveryRate);
    }
  } else {
    // Without filter, natural slow decline
    clarity = Math.max(40, clarity - 0.03 * effectiveDt);
  }

  return {
    updatedEquipment: eq,
    updatedLeftoversCount: leftovers,
    updatedClarityPercent: Math.round(clarity * 10) / 10,
    recentEvent
  };
}
