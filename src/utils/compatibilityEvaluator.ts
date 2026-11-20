import { TankConfig, SpeciesData } from '../types';
import { calculateTankVolume } from './tankGeometry';
import { getSpeciesById } from '../data/speciesData';

export interface CompatibilityIssue {
  severity: 'blocker' | 'warning' | 'info';
  category: 'water_type' | 'temperature' | 'volume' | 'schooling' | 'territory' | 'shape';
  message: string;
  recommendation: string;
}

export interface TankCompatibilityReport {
  isCompatible: boolean;
  score: number; // 0..100
  statusSummary: string;
  issues: CompatibilityIssue[];
}

export function evaluateSpeciesCompatibility(
  candidateSpecies: SpeciesData,
  candidateQuantity: number,
  tank: TankConfig
): TankCompatibilityReport {
  const issues: CompatibilityIssue[] = [];
  const { volumeLiters } = calculateTankVolume(tank.shape, tank.dimensions, tank.waterLevelPercent);

  // 1. Water Type Compatibility (HARD BLOCKER)
  if (candidateSpecies.habitat !== tank.waterType) {
    issues.push({
      severity: 'blocker',
      category: 'water_type',
      message: `Habitat mismatch: ${candidateSpecies.commonName} is a ${candidateSpecies.habitat.toUpperCase()} species, but this tank is set up for ${tank.waterType.toUpperCase()}.`,
      recommendation: `Convert the tank to ${candidateSpecies.habitat} in the Tank Builder, or select a ${tank.waterType} species.`
    });
  }

  // Check if adding this species mixes with existing inhabitants of different water type
  for (const inhabitant of tank.inhabitants) {
    const existingSpecies = getSpeciesById(inhabitant.speciesId);
    if (existingSpecies && existingSpecies.habitat !== candidateSpecies.habitat) {
      issues.push({
        severity: 'blocker',
        category: 'water_type',
        message: `Cross-salinity conflict: Cannot mix freshwater animals (${candidateSpecies.habitat === 'marine' ? existingSpecies.commonName : candidateSpecies.commonName}) with marine animals (${candidateSpecies.habitat === 'marine' ? candidateSpecies.commonName : existingSpecies.commonName}).`,
        recommendation: `Freshwater and saltwater organisms have completely different osmoregulation systems and cannot survive together.`
      });
      break;
    }
  }

  // 2. Temperature Requirements
  const currentTemp = tank.equipment.heaterEnabled ? tank.equipment.heaterTargetTemp : tank.equipment.roomTemp;
  if (currentTemp < candidateSpecies.minTempC) {
    issues.push({
      severity: 'warning',
      category: 'temperature',
      message: `Water temperature (${currentTemp.toFixed(1)}°C) is below the recommended minimum for ${candidateSpecies.commonName} (${candidateSpecies.minTempC}°C).`,
      recommendation: `Increase the heater target temperature to at least ${candidateSpecies.minTempC}°C in the Equipment panel.`
    });
  } else if (currentTemp > candidateSpecies.maxTempC) {
    issues.push({
      severity: 'warning',
      category: 'temperature',
      message: `Water temperature (${currentTemp.toFixed(1)}°C) exceeds the safe threshold for ${candidateSpecies.commonName} (${candidateSpecies.maxTempC}°C).`,
      recommendation: `Lower the heater target temperature to below ${candidateSpecies.maxTempC}°C.`
    });
  }

  // 3. Tank Volume & Bioload
  // Rule of thumb: cm of adult fish per liter
  const existingBioload = tank.inhabitants.reduce((sum, fish) => {
    const spec = getSpeciesById(fish.speciesId);
    return sum + (spec ? spec.adultSizeCm : 4);
  }, 0);
  const additionalBioload = candidateQuantity * candidateSpecies.adultSizeCm;
  const totalBioload = existingBioload + additionalBioload;
  const maxRecommendedBioload = volumeLiters * 1.5;

  if (volumeLiters < candidateSpecies.minVolumeLiters) {
    issues.push({
      severity: 'warning',
      category: 'volume',
      message: `Tank volume (~${volumeLiters} L) is smaller than the minimum recommended volume of ${candidateSpecies.minVolumeLiters} L for ${candidateSpecies.commonName}.`,
      recommendation: `Consider expanding tank dimensions or selecting a nano species such as Cherry Shrimp or Endlers.`
    });
  } else if (totalBioload > maxRecommendedBioload) {
    issues.push({
      severity: 'warning',
      category: 'volume',
      message: `High bioload warning: Adding ${candidateQuantity} × ${candidateSpecies.commonName} will exceed optimal filtration capacity (~${Math.round(totalBioload)} cm bioload for ${volumeLiters} L).`,
      recommendation: `Maintain strong filtration and aeration to prevent rapid nitrate accumulation.`
    });
  }

  // 4. Social Needs (Schooling minimums)
  const existingCountOfSameSpecies = tank.inhabitants.filter(f => f.speciesId === candidateSpecies.id).length;
  const totalAfterAdd = existingCountOfSameSpecies + candidateQuantity;

  if (candidateSpecies.socialBehavior === 'schooling' && totalAfterAdd < candidateSpecies.minGroupSize) {
    issues.push({
      severity: 'info',
      category: 'schooling',
      message: `${candidateSpecies.commonName} is a schooling species that feels safest in groups of at least ${candidateSpecies.minGroupSize} (currently adding to total ${totalAfterAdd}).`,
      recommendation: `Increase the quantity to ${candidateSpecies.minGroupSize} or more to see authentic schooling behaviors.`
    });
  }

  // 5. Territorial Conflicts (e.g. Betta males)
  if (candidateSpecies.id === 'betta') {
    const existingBettas = tank.inhabitants.filter(f => f.speciesId === 'betta').length;
    if (existingBettas > 0 || candidateQuantity > 1) {
      issues.push({
        severity: 'blocker',
        category: 'territory',
        message: `Territorial conflict: Siamese Fighting Fish (Bettas) are solitary and highly aggressive toward rival bettas in the same enclosure.`,
        recommendation: `House only one Betta per aquarium to prevent severe stress and fighting.`
      });
    }
  }

  // 6. Tank Shape Suitability
  if (tank.shape === 'bowl') {
    if (candidateSpecies.socialBehavior === 'schooling' || candidateSpecies.adultSizeCm > 5) {
      issues.push({
        severity: 'info',
        category: 'shape',
        message: `Bowl geometry restricts horizontal swimming tracks and surface gas exchange, which can limit the swimming dynamics of ${candidateSpecies.commonName}.`,
        recommendation: `Rectangular or panoramic tanks offer better cruising corridors for active swimmers.`
      });
    }
  }

  // Scoring
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === 'blocker') score -= 50;
    else if (issue.severity === 'warning') score -= 20;
    else if (issue.severity === 'info') score -= 5;
  }
  score = Math.max(0, Math.min(100, score));

  const hasBlockers = issues.some(i => i.severity === 'blocker');
  let statusSummary = 'Excellent match! This species will flourish in your setup.';
  if (hasBlockers) {
    statusSummary = 'Incompatible with current tank parameters.';
  } else if (score < 75) {
    statusSummary = 'Sub-optimal conditions. Review recommendations before adding.';
  } else if (score < 90) {
    statusSummary = 'Good compatibility with minor considerations.';
  }

  return {
    isCompatible: !hasBlockers,
    score,
    statusSummary,
    issues
  };
}
