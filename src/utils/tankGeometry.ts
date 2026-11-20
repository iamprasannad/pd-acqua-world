import { TankDimensions, TankShape } from '../types';

export interface VolumeResult {
  volumeLiters: number;
  isApproximate: boolean;
  formulaDescription: string;
}

/**
 * Calculates estimated water volume in Liters based on tank geometry and fill level.
 */
export function calculateTankVolume(
  shape: TankShape,
  dims: TankDimensions,
  fillPercent: number
): VolumeResult {
  const fill = Math.max(0.1, Math.min(1.0, fillPercent / 100));
  const { widthCm: w, heightCm: h, depthCm: d } = dims;

  switch (shape) {
    case 'bowl': {
      // Truncated sphere approximation with diameter W and height H
      // Usable volume is approximately 0.65 * cylinder volume
      const r = w / 2;
      const effectiveH = h * fill;
      // Formula for spherical segment: pi * h^2 * (3R - h) / 3
      const volumeCm3 = (Math.PI * Math.pow(effectiveH, 2) * (3 * r - effectiveH)) / 3;
      const volLiters = Math.max(2, Math.round((volumeCm3 / 1000) * 10) / 10);
      return {
        volumeLiters: volLiters,
        isApproximate: true,
        formulaDescription: 'Spherical cap geometry approximation'
      };
    }
    case 'cylinder': {
      // Cylinder: pi * r^2 * h * fill
      const r = w / 2;
      const volumeCm3 = Math.PI * Math.pow(r, 2) * (h * fill);
      return {
        volumeLiters: Math.round((volumeCm3 / 1000) * 10) / 10,
        isApproximate: false,
        formulaDescription: 'π × r² × h × fill level'
      };
    }
    case 'hexagonal': {
      // Regular hexagon: Area = (3 * sqrt(3) / 2) * s^2 where s = w / 2
      const s = w / 2;
      const baseArea = ((3 * Math.sqrt(3)) / 2) * Math.pow(s, 2);
      const volumeCm3 = baseArea * (h * fill);
      return {
        volumeLiters: Math.round((volumeCm3 / 1000) * 10) / 10,
        isApproximate: true,
        formulaDescription: 'Hexagonal prism: (3√3 / 2) × side² × height'
      };
    }
    case 'bowfront': {
      // Rectangular box + bowed front cylindrical lens segment (~15-18% extra)
      const baseVol = (w * h * d * fill) / 1000;
      const bowExtra = baseVol * 0.16;
      return {
        volumeLiters: Math.round((baseVol + bowExtra) * 10) / 10,
        isApproximate: true,
        formulaDescription: 'Rectangular prism + 16% curved bow-front segment'
      };
    }
    case 'corner': {
      // Quarter cylinder / 90° prism: (pi / 4) * w^2 * h * fill
      const baseArea = (Math.PI / 4) * Math.pow(w, 2);
      const volumeCm3 = baseArea * (h * fill);
      return {
        volumeLiters: Math.round((volumeCm3 / 1000) * 10) / 10,
        isApproximate: true,
        formulaDescription: 'Quarter-cylinder corner prism: (π/4) × radius² × height'
      };
    }
    case 'cube':
    case 'rectangular':
    case 'panoramic':
    case 'shallow':
    case 'portrait':
    default: {
      const volumeCm3 = w * d * (h * fill);
      return {
        volumeLiters: Math.round((volumeCm3 / 1000) * 10) / 10,
        isApproximate: false,
        formulaDescription: 'Width × Depth × Water Height / 1000'
      };
    }
  }
}

/**
 * Checks if normalized coordinates (x: 0..1, y: 0..1) are inside the usable habitat
 * for the given tank shape and water fill level.
 * y: 0 is water top, 1 is substrate bottom.
 */
export function isInsideTank(
  x: number,
  y: number,
  shape: TankShape,
  waterLevelPercent: number = 90
): boolean {
  const topThreshold = 1.0 - (waterLevelPercent / 100);
  // Must be below water line and above bottom substrate
  if (y < topThreshold || y > 0.95) return false;
  if (x < 0.04 || x > 0.96) return false;

  switch (shape) {
    case 'bowl': {
      // Elliptical bowl: center (0.5, 0.55), radius X 0.44, radius Y 0.42
      // with flattened bottom at y = 0.92 and open top
      const cx = 0.5;
      const cy = 0.52;
      const rx = 0.44;
      const ry = 0.42;
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy > 0.96) return false;
      // Bowl base narrowing
      if (y > 0.85) {
        const baseWidthRatio = 1.0 - (y - 0.85) * 3.5;
        if (Math.abs(x - 0.5) > 0.4 * Math.max(0.3, baseWidthRatio)) return false;
      }
      return true;
    }
    case 'cylinder': {
      // Narrower near vertical edges due to cylindrical curvature
      return x >= 0.08 && x <= 0.92;
    }
    case 'hexagonal': {
      // 6-sided facet: bevel at top corners and bottom corners
      if (y < 0.3) {
        const topIndent = (0.3 - y) * 0.7;
        if (x < 0.05 + topIndent || x > 0.95 - topIndent) return false;
      }
      if (y > 0.7) {
        const btmIndent = (y - 0.7) * 0.7;
        if (x < 0.05 + btmIndent || x > 0.95 - btmIndent) return false;
      }
      return true;
    }
    case 'corner': {
      // Angled corner face: hypotenuse on right side
      if (x + y > 1.45) return false;
      return true;
    }
    case 'bowfront': {
      // Bow front has wider swimming room in center
      return true;
    }
    default:
      return true;
  }
}

/**
 * Returns boundaries of swimming room for fish guidance and clamp.
 */
export function getHabitatBounds(
  shape: TankShape,
  waterLevelPercent: number = 90
): { minX: number; maxX: number; minY: number; maxY: number } {
  const minY = 1.0 - (waterLevelPercent / 100) + 0.03;
  const maxY = 0.92;

  switch (shape) {
    case 'bowl':
      return { minX: 0.16, maxX: 0.84, minY: Math.max(minY, 0.18), maxY: 0.88 };
    case 'cylinder':
      return { minX: 0.12, maxX: 0.88, minY, maxY };
    case 'hexagonal':
      return { minX: 0.1, maxX: 0.9, minY, maxY };
    case 'corner':
      return { minX: 0.08, maxX: 0.86, minY, maxY: 0.88 };
    case 'panoramic':
      return { minX: 0.05, maxX: 0.95, minY, maxY };
    case 'shallow':
      return { minX: 0.06, maxX: 0.94, minY: Math.max(minY, 0.25), maxY };
    case 'portrait':
      return { minX: 0.12, maxX: 0.88, minY, maxY };
    default:
      return { minX: 0.06, maxX: 0.94, minY, maxY };
  }
}

/**
 * Creates canvas clipping path matching the exact inner glass and water volume of the selected tank shape.
 */
export function createTankClipPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  shape: TankShape,
  waterLevelPercent: number = 90
): void {
  ctx.beginPath();
  const waterTop = y + h * (1.0 - (waterLevelPercent / 100));
  const bottom = y + h;

  switch (shape) {
    case 'bowl': {
      // Curved round bowl with flattened base and curved top lip
      const cx = x + w / 2;
      const cy = y + h * 0.54;
      const rx = w * 0.46;
      const ry = h * 0.44;

      ctx.moveTo(x + w * 0.18, waterTop);
      // Top waterline arc
      ctx.quadraticCurveTo(cx, waterTop + 6, x + w * 0.82, waterTop);
      // Right side curve down
      ctx.bezierCurveTo(x + w * 0.99, y + h * 0.4, x + w * 0.96, y + h * 0.82, x + w * 0.68, bottom - 12);
      // Flat bowl bottom
      ctx.quadraticCurveTo(cx, bottom - 6, x + w * 0.32, bottom - 12);
      // Left side curve up
      ctx.bezierCurveTo(x + w * 0.04, y + h * 0.82, x + w * 0.01, y + h * 0.4, x + w * 0.18, waterTop);
      break;
    }
    case 'cylinder': {
      // Cylinder with curved top and bottom ellipses
      const rx = w * 0.46;
      const cx = x + w / 2;
      ctx.ellipse(cx, waterTop, rx, 14, 0, Math.PI, 0, false);
      ctx.lineTo(x + w * 0.96, bottom - 16);
      ctx.ellipse(cx, bottom - 16, rx, 16, 0, 0, Math.PI, false);
      ctx.lineTo(x + w * 0.04, waterTop);
      break;
    }
    case 'hexagonal': {
      // 6-sided faceted profile
      const insetX = w * 0.18;
      ctx.moveTo(x + insetX, waterTop);
      ctx.lineTo(x + w - insetX, waterTop);
      ctx.lineTo(x + w - 8, y + h * 0.5);
      ctx.lineTo(x + w - insetX, bottom - 12);
      ctx.lineTo(x + insetX, bottom - 12);
      ctx.lineTo(x + 8, y + h * 0.5);
      ctx.closePath();
      break;
    }
    case 'corner': {
      // Angled corner prism: viewing diagonal face
      ctx.moveTo(x + 12, waterTop);
      ctx.lineTo(x + w * 0.88, waterTop);
      ctx.lineTo(x + w - 12, y + h * 0.55);
      ctx.lineTo(x + w * 0.6, bottom - 12);
      ctx.lineTo(x + 12, bottom - 12);
      ctx.closePath();
      break;
    }
    case 'bowfront': {
      // Curved front glass: bowed outward at bottom and middle
      const r = 16;
      ctx.moveTo(x + r, waterTop);
      ctx.lineTo(x + w - r, waterTop);
      ctx.quadraticCurveTo(x + w + 12, y + h * 0.5, x + w - r, bottom - 12);
      ctx.quadraticCurveTo(x + w / 2, bottom + 4, x + r, bottom - 12);
      ctx.quadraticCurveTo(x - 12, y + h * 0.5, x + r, waterTop);
      break;
    }
    case 'cube':
    case 'rectangular':
    case 'panoramic':
    case 'shallow':
    case 'portrait':
    default: {
      const r = 12; // sleek rounded corners on glass
      ctx.moveTo(x + r, waterTop);
      ctx.lineTo(x + w - r, waterTop);
      ctx.arcTo(x + w, waterTop, x + w, waterTop + r, r);
      ctx.lineTo(x + w, bottom - r);
      ctx.arcTo(x + w, bottom, x + w - r, bottom, r);
      ctx.lineTo(x + r, bottom);
      ctx.arcTo(x, bottom, x, bottom - r, r);
      ctx.lineTo(x, waterTop + r);
      ctx.arcTo(x, waterTop, x + r, waterTop, r);
      break;
    }
  }
}
