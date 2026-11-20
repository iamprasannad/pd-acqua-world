import { describe, it, expect } from 'vitest';
import { evaluateSpeciesCompatibility } from '../src/utils/compatibilityEvaluator';
import { getSpeciesById } from '../src/data/speciesData';
import { createBlueFinsHome, createMarineReefPreset } from '../src/data/tankPresets';

describe('Species Compatibility Evaluator', () => {
  it('blocks adding marine animals to freshwater tank', () => {
    const freshwaterTank = createBlueFinsHome();
    const clownfish = getSpeciesById('ocellaris_clownfish')!;
    const report = evaluateSpeciesCompatibility(clownfish, 2, freshwaterTank);

    expect(report.isCompatible).toBe(false);
    expect(report.issues.some(i => i.category === 'water_type')).toBe(true);
    expect(report.statusSummary).toContain('Incompatible');
  });

  it('blocks adding multiple male bettas due to territorial aggression', () => {
    const tankWithBetta = createBlueFinsHome();
    const betta = getSpeciesById('betta')!;
    const report = evaluateSpeciesCompatibility(betta, 1, tankWithBetta);

    expect(report.isCompatible).toBe(false);
    expect(report.issues.some(i => i.category === 'territory')).toBe(true);
    expect(report.issues.find(i => i.category === 'territory')?.message).toContain('Territorial conflict');
  });

  it('warns if adding schooling fish in numbers below minimum group size', () => {
    const freshwaterTank = createBlueFinsHome();
    const neonTetra = getSpeciesById('neon_tetra')!;
    // Adding only 2 tetras when min group is 6
    const report = evaluateSpeciesCompatibility(neonTetra, 2, freshwaterTank);

    expect(report.issues.some(i => i.category === 'schooling')).toBe(true);
    expect(report.issues.find(i => i.category === 'schooling')?.message).toContain('schooling species');
  });

  it('evaluates marine reef species properly in marine setup', () => {
    const marineTank = createMarineReefPreset();
    // Clear inhabitants for clean test
    marineTank.inhabitants = [];
    const royalGramma = getSpeciesById('royal_gramma')!;
    const report = evaluateSpeciesCompatibility(royalGramma, 1, marineTank);

    expect(report.isCompatible).toBe(true);
    expect(report.score).toBeGreaterThanOrEqual(90);
  });
});
