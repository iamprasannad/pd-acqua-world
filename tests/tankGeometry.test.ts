import { describe, it, expect } from 'vitest';
import { calculateTankVolume, isInsideTank, getHabitatBounds } from '../src/utils/tankGeometry';

describe('Tank Geometry & Usable Volume', () => {
  it('calculates rectangular tank volume accurately', () => {
    // 50 x 35 x 30 cm at 90% fill: 50 * 35 * 30 * 0.9 / 1000 = 47.25 L
    const res = calculateTankVolume('rectangular', { widthCm: 50, heightCm: 35, depthCm: 30 }, 90);
    expect(res.volumeLiters).toBeCloseTo(47.3, 0.5);
    expect(res.isApproximate).toBe(false);
  });

  it('calculates bowl volume as spherical cap approximation', () => {
    const res = calculateTankVolume('bowl', { widthCm: 30, heightCm: 25, depthCm: 30 }, 90);
    expect(res.volumeLiters).toBeGreaterThan(5);
    expect(res.isApproximate).toBe(true);
    expect(res.formulaDescription).toContain('Spherical cap');
  });

  it('calculates hexagonal tank volume correctly with prism formula', () => {
    const res = calculateTankVolume('hexagonal', { widthCm: 40, heightCm: 45, depthCm: 40 }, 90);
    expect(res.volumeLiters).toBeGreaterThan(10);
    expect(res.isApproximate).toBe(true);
  });

  it('constrains points inside bowl shape narrower at base', () => {
    // Center point inside water
    expect(isInsideTank(0.5, 0.5, 'bowl', 90)).toBe(true);
    // Extreme corner outside bowl curvature
    expect(isInsideTank(0.05, 0.05, 'bowl', 90)).toBe(false);
    expect(isInsideTank(0.95, 0.95, 'bowl', 90)).toBe(false);
    // Bowl base narrowing at y = 0.9
    expect(isInsideTank(0.15, 0.9, 'bowl', 90)).toBe(false);
  });

  it('provides distinct habitat bounds per shape', () => {
    const bowlBounds = getHabitatBounds('bowl', 90);
    const rectBounds = getHabitatBounds('panoramic', 90);
    expect(bowlBounds.minX).toBeGreaterThan(rectBounds.minX);
    expect(rectBounds.maxX).toBeGreaterThan(bowlBounds.maxX);
  });
});
