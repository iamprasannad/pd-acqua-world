import {
  TankConfig,
  FishInstance,
  FoodParticle,
  Bubble,
  SurfaceRipple,
  DecorItem
} from '../types';
import { createTankClipPath } from '../utils/tankGeometry';

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tank: TankConfig;
  fishList: FishInstance[];
  foodParticles: FoodParticle[];
  bubbles: Bubble[];
  ripples: SurfaceRipple[];
  timeSec: number;
  selectedFishId: string | null;
  lowEffectsMode: boolean;
}

export function renderAquariumScene(rc: RenderContext): void {
  const { canvas, ctx, tank, fishList, foodParticles, bubbles, ripples, timeSec, selectedFishId, lowEffectsMode } = rc;
  const w = canvas.width;
  const h = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, w, h);

  // Tank padding within viewport
  const paddingX = Math.max(16, w * 0.04);
  const paddingY = Math.max(16, h * 0.05);
  const tankX = paddingX;
  const tankY = paddingY;
  const tankW = w - paddingX * 2;
  const tankH = h - paddingY * 2;

  // 1. Draw Aquarium Stand / Frame Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#020b14';
  createTankClipPath(ctx, tankX, tankY, tankW, tankH, tank.shape, 100);
  ctx.fill();
  ctx.restore();

  // 2. Setup Tank Interior Clipping
  ctx.save();
  createTankClipPath(ctx, tankX, tankY, tankW, tankH, tank.shape, 100);
  ctx.clip();

  // 2.1 Draw Water & Background Gradient
  drawTankBackground(ctx, tankX, tankY, tankW, tankH, tank.background, tank.lighting.preset, tank.waterType);

  // 2.2 Draw Substrate at Bottom
  drawSubstrate(ctx, tankX, tankY, tankW, tankH, tank.substrate, timeSec, lowEffectsMode);

  // 2.3 Draw Caustics Ripples (Sunlight dancing on substrate)
  if (!lowEffectsMode && tank.lighting.preset !== 'off') {
    drawCaustics(ctx, tankX, tankY, tankW, tankH, timeSec, tank.lighting.preset);
  }

  // 2.4 Draw Background Decor Items (depthZone === 'back')
  drawDecorLayer(ctx, tankX, tankY, tankW, tankH, tank.decor.filter(d => d.depthZone === 'back'), timeSec, tank.equipment.filterFlowStrength);

  // 2.5 Draw Mid Decor Items (depthZone === 'mid')
  drawDecorLayer(ctx, tankX, tankY, tankW, tankH, tank.decor.filter(d => d.depthZone === 'mid'), timeSec, tank.equipment.filterFlowStrength);

  // 2.6 Draw Bubbles behind fish
  drawBubbles(ctx, tankX, tankY, tankW, tankH, bubbles);

  // 2.7 Draw Food Particles
  drawFoodParticles(ctx, tankX, tankY, tankW, tankH, foodParticles);

  // 2.8 Draw Living Fish (sorted by depthZ for believable 2.5D overlap)
  const sortedFish = [...fishList].sort((a, b) => a.depthZ - b.depthZ);
  for (const fish of sortedFish) {
    drawFish(ctx, tankX, tankY, tankW, tankH, fish, timeSec, fish.id === selectedFishId);
  }

  // 2.9 Draw Foreground Decor Items (depthZone === 'front')
  drawDecorLayer(ctx, tankX, tankY, tankW, tankH, tank.decor.filter(d => d.depthZone === 'front'), timeSec, tank.equipment.filterFlowStrength);

  // 2.10 Draw Waterline Surface Waves
  drawWaterlineSurface(ctx, tankX, tankY, tankW, tankH, tank.waterLevelPercent, timeSec, ripples);

  // 2.11 Draw Dynamic Lighting & Atmosphere Overlay
  drawLightingOverlay(ctx, tankX, tankY, tankW, tankH, tank.lighting);

  // 2.12 Draw Water Clarity Haze (if leftovers clouded the tank)
  if (tank.clarityPercent < 90) {
    const hazeAlpha = (100 - tank.clarityPercent) / 100 * 0.45;
    ctx.fillStyle = `rgba(180, 160, 120, ${hazeAlpha})`;
    ctx.fillRect(tankX, tankY, tankW, tankH);
  }

  // End Clip
  ctx.restore();

  // 3. Draw Outer Glass Reflections, Bevels, Rim Highlights & Tank Frame
  drawGlassFrameAndReflections(ctx, tankX, tankY, tankW, tankH, tank.shape, tank.waterLevelPercent);
}

function drawTankBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  bgType: string,
  lightingPreset: string,
  waterType: string
): void {
  const grad = ctx.createLinearGradient(x, y, x, y + h);

  if (lightingPreset === 'off') {
    grad.addColorStop(0, '#01050a');
    grad.addColorStop(1, '#000205');
  } else if (lightingPreset === 'midnight') {
    grad.addColorStop(0, '#04101e');
    grad.addColorStop(0.6, '#020b14');
    grad.addColorStop(1, '#01070e');
  } else if (bgType === 'deep_blue' || waterType === 'marine') {
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.35, '#0369a1');
    grad.addColorStop(0.75, '#072e54');
    grad.addColorStop(1, '#031427');
  } else if (bgType === 'planted_aqua') {
    grad.addColorStop(0, '#0d9488');
    grad.addColorStop(0.4, '#0f766e');
    grad.addColorStop(0.7, '#134e4a');
    grad.addColorStop(1, '#042f2e');
  } else if (bgType === 'midnight_black') {
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#020617');
  } else if (bgType === 'slate_rock') {
    grad.addColorStop(0, '#334155');
    grad.addColorStop(0.5, '#1e293b');
    grad.addColorStop(1, '#09101d');
  } else if (bgType === 'horizon_gradient') {
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.45, '#0284c7');
    grad.addColorStop(0.85, '#082f49');
    grad.addColorStop(1, '#031427');
  } else {
    // Frosted glass
    grad.addColorStop(0, '#64748b');
    grad.addColorStop(0.6, '#334155');
    grad.addColorStop(1, '#0f172a');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
}

function drawSubstrate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  subType: string,
  timeSec: number,
  lowEffects: boolean
): void {
  const subHeight = h * 0.12;
  const subY = y + h - subHeight;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, subY + 6);

  // Gentle undulating terrain hills
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const px = x + (w / steps) * i;
    const wave = Math.sin(i * 0.7) * 4 + Math.cos(i * 1.3) * 3;
    ctx.lineTo(px, subY + wave);
  }
  ctx.lineTo(x + w, y + h);
  ctx.closePath();

  let topColor = '#d97706';
  let btmColor = '#78350f';

  if (subType === 'sand') {
    topColor = '#fef08a';
    btmColor = '#ca8a04';
  } else if (subType === 'dark_soil') {
    topColor = '#3f3f46';
    btmColor = '#18181b';
  } else if (subType === 'coral_sand') {
    topColor = '#f8fafc';
    btmColor = '#cbd5e1';
  } else {
    // Gravel
    topColor = '#a8a29e';
    btmColor = '#44403c';
  }

  const grad = ctx.createLinearGradient(x, subY, x, y + h);
  grad.addColorStop(0, topColor);
  grad.addColorStop(1, btmColor);
  ctx.fillStyle = grad;
  ctx.fill();

  // Draw pebble texture dots if not low-effects
  if (!lowEffects) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let i = 0; i < 40; i++) {
      const rx = x + ((i * 37) % w);
      const ry = subY + 6 + ((i * 23) % (subHeight - 8));
      ctx.beginPath();
      ctx.arc(rx, ry, 1.5 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawCaustics(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  timeSec: number,
  preset: string
): void {
  ctx.save();
  const subY = y + h * 0.75;
  const causticsH = h * 0.25;

  let opacity = 0.14;
  if (preset === 'afternoon') opacity = 0.22;
  else if (preset === 'dusk' || preset === 'morning') opacity = 0.12;
  else if (preset === 'midnight') opacity = 0.05;

  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

  // Animated wave pattern using overlapping sines
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    const cx = x + (w / 8) * i;
    const waveX = Math.sin(timeSec * 1.5 + i * 1.2) * 20;
    const waveY = Math.cos(timeSec * 1.2 + i * 0.8) * 6;

    ctx.ellipse(
      cx + waveX,
      subY + waveY + (i % 2) * 16,
      w * 0.08,
      12,
      (i * 0.3),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.restore();
}

function drawDecorLayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  decorList: DecorItem[],
  timeSec: number,
  flowStrength: number
): void {
  for (const d of decorList) {
    ctx.save();
    const dx = x + d.x * w;
    const dy = y + d.y * h;

    ctx.translate(dx, dy);
    ctx.rotate((d.rotation * Math.PI) / 180);
    if (d.flipped) ctx.scale(-1, 1);
    ctx.scale(d.scale, d.scale);

    // Current sway for foliage
    const sway = Math.sin(timeSec * 2 + d.x * 5) * (0.05 + flowStrength * 0.08);

    switch (d.type) {
      case 'broad_leaf_plant': {
        // Broad leaf Anubias with green gradients and veins
        ctx.save();
        ctx.rotate(sway);
        // Stem
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-15, -40, -10, -75);
        ctx.stroke();

        // 3 broad lush leaves
        const drawLeaf = (lx: number, ly: number, angle: number, size: number) => {
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(angle);
          const leafGrad = ctx.createLinearGradient(0, 0, 0, -size);
          leafGrad.addColorStop(0, '#166534');
          leafGrad.addColorStop(0.5, '#22c55e');
          leafGrad.addColorStop(1, '#4ade80');
          ctx.fillStyle = leafGrad;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(size * 0.35, -size * 0.4, 0, -size);
          ctx.quadraticCurveTo(-size * 0.35, -size * 0.4, 0, 0);
          ctx.fill();
          // Midrib vein
          ctx.strokeStyle = '#86efac';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -size * 0.85);
          ctx.stroke();
          ctx.restore();
        };
        drawLeaf(0, 0, -0.4, 65);
        drawLeaf(-8, -35, 0.35, 75);
        drawLeaf(-10, -75, -0.15, 80);
        ctx.restore();
        break;
      }
      case 'tall_plant': {
        // Tall Vallisneria ribbon leaves
        ctx.save();
        for (let j = 0; j < 4; j++) {
          const ribbonSway = Math.sin(timeSec * 2.2 + j * 0.6) * (15 + flowStrength * 30);
          const rGrad = ctx.createLinearGradient(0, 0, ribbonSway, -130);
          rGrad.addColorStop(0, '#14532d');
          rGrad.addColorStop(0.5, '#16a34a');
          rGrad.addColorStop(1, '#86efac');
          ctx.strokeStyle = rGrad;
          ctx.lineWidth = 6 - j;
          ctx.beginPath();
          ctx.moveTo((j - 1.5) * 8, 0);
          ctx.bezierCurveTo(
            (j - 1.5) * 8 + ribbonSway * 0.4, -40,
            (j - 1.5) * 8 + ribbonSway * 0.8, -90,
            (j - 1.5) * 8 + ribbonSway, -135
          );
          ctx.stroke();
        }
        ctx.restore();
        break;
      }
      case 'driftwood_branch':
      case 'driftwood_stump': {
        // Natural weathered bogwood
        const woodGrad = ctx.createLinearGradient(-30, -50, 40, 20);
        woodGrad.addColorStop(0, '#78350f');
        woodGrad.addColorStop(0.5, '#451a03');
        woodGrad.addColorStop(1, '#291102');
        ctx.fillStyle = woodGrad;

        ctx.beginPath();
        ctx.moveTo(-35, 0);
        ctx.quadraticCurveTo(-25, -45, 0, -55);
        ctx.quadraticCurveTo(35, -40, 50, -10);
        ctx.quadraticCurveTo(30, -5, 20, 0);
        ctx.quadraticCurveTo(-10, -15, -35, 0);
        ctx.fill();

        // Branch spur
        ctx.beginPath();
        ctx.moveTo(10, -45);
        ctx.quadraticCurveTo(35, -75, 55, -85);
        ctx.quadraticCurveTo(50, -70, 22, -40);
        ctx.fill();
        break;
      }
      case 'smooth_stone': {
        // River stones cluster
        const stoneGrad = ctx.createRadialGradient(-10, -15, 5, 0, 0, 35);
        stoneGrad.addColorStop(0, '#94a3b8');
        stoneGrad.addColorStop(0.7, '#475569');
        stoneGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = stoneGrad;

        ctx.beginPath();
        ctx.ellipse(0, 0, 32, 20, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(22, 4, 18, 12, -0.2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'dragon_stone': {
        // Dragon stone with jagged perforated edges
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.lineTo(-20, -35);
        ctx.lineTo(-5, -60);
        ctx.lineTo(8, -45);
        ctx.lineTo(20, -55);
        ctx.lineTo(30, 0);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'moss_ball': {
        // Marimo moss cushion
        const mossGrad = ctx.createRadialGradient(-5, -5, 4, 0, 0, 22);
        mossGrad.addColorStop(0, '#4ade80');
        mossGrad.addColorStop(0.6, '#15803d');
        mossGrad.addColorStop(1, '#14532d');
        ctx.fillStyle = mossGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'live_rock': {
        // Marine live rock
        const rockGrad = ctx.createLinearGradient(-30, -40, 30, 20);
        rockGrad.addColorStop(0, '#831843'); // Coralline algae purple
        rockGrad.addColorStop(0.6, '#581c87');
        rockGrad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = rockGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 40, 25, 0.15, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'marine_coral': {
        // Staghorn branching coral
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-5, -30);
        ctx.lineTo(-25, -60);
        ctx.moveTo(-5, -30);
        ctx.lineTo(15, -65);
        ctx.moveTo(5, -45);
        ctx.lineTo(30, -75);
        ctx.stroke();
        break;
      }
      case 'sea_anemone': {
        // Sea anemone with swaying tentacles
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.ellipse(0, 5, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let t = -6; t <= 6; t++) {
          const tSway = Math.sin(timeSec * 3 + t * 0.8) * 8;
          ctx.strokeStyle = '#fda4af';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(t * 3, 0);
          ctx.quadraticCurveTo(t * 3.5 + tSway * 0.5, -20, t * 4 + tSway, -38);
          ctx.stroke();
        }
        break;
      }
      case 'airstone': {
        // Air stone diffuser block
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-12, -8, 24, 16);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(-12, -8, 24, 16);
        break;
      }
    }

    ctx.restore();
  }
}

function drawBubbles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  bubbles: Bubble[]
): void {
  ctx.save();
  for (const b of bubbles) {
    const bx = x + b.x * w;
    const by = y + b.y * h;

    ctx.beginPath();
    ctx.arc(bx, by, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Bubble specular gleam
    ctx.beginPath();
    ctx.arc(bx - b.radius * 0.35, by - b.radius * 0.35, b.radius * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }
  ctx.restore();
}

function drawFoodParticles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  foodParticles: FoodParticle[]
): void {
  ctx.save();
  for (const p of foodParticles) {
    if (p.eaten) continue;
    const px = x + p.x * w;
    const py = y + p.y * h;

    ctx.fillStyle = p.color;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 0.7;

    if (p.type === 'flakes') {
      // Flakes: thin angled trapezoid/leaf shape
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(Math.sin(p.wobblePhase));
      ctx.beginPath();
      ctx.moveTo(-p.size, -p.size * 0.4);
      ctx.lineTo(p.size, -p.size * 0.6);
      ctx.lineTo(p.size * 0.8, p.size * 0.6);
      ctx.lineTo(-p.size * 0.6, p.size * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (p.type === 'wafers') {
      // Sinking wafers: flat disc
      ctx.beginPath();
      ctx.ellipse(px, py, p.size * 1.5, p.size * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Pellets & Granules: sphere with highlight
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Top specular highlight
      ctx.beginPath();
      ctx.arc(px - p.size * 0.3, py - p.size * 0.3, p.size * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawFish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fish: FishInstance,
  timeSec: number,
  isSelected: boolean
): void {
  const fx = x + fish.x * w;
  const fy = y + fish.y * h;

  ctx.save();
  ctx.translate(fx, fy);
  ctx.rotate(fish.heading);

  // If fish is swimming leftwards (heading in 2nd or 3rd quadrant), flip vertically so back is up
  const isFacingLeft = Math.cos(fish.heading) < 0;
  if (isFacingLeft) {
    ctx.scale(1, -1);
  }

  // Selection ring
  if (isSelected) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.stroke();

    // Subtle selection beacon
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fill();
    ctx.restore();
  }

  // Draw specific species silhouette & fins
  const spId = fish.speciesId;

  if (spId === 'betta') {
    drawBetta(ctx, fish);
  } else if (spId === 'neon_tetra') {
    drawNeonTetra(ctx, fish);
  } else if (spId === 'guppy') {
    drawGuppy(ctx, fish);
  } else if (spId === 'platy') {
    drawPlaty(ctx, fish);
  } else if (spId === 'harlequin_rasbora') {
    drawHarlequinRasbora(ctx, fish);
  } else if (spId === 'zebra_danio') {
    drawZebraDanio(ctx, fish);
  } else if (spId === 'panda_cory') {
    drawPandaCory(ctx, fish);
  } else if (spId === 'honey_gourami') {
    drawHoneyGourami(ctx, fish);
  } else if (spId === 'cherry_shrimp') {
    drawCherryShrimp(ctx, fish);
  } else if (spId === 'ocellaris_clownfish') {
    drawClownfish(ctx, fish);
  } else if (spId === 'royal_gramma') {
    drawRoyalGramma(ctx, fish);
  } else if (spId === 'pajama_cardinalfish') {
    drawPajamaCardinal(ctx, fish);
  } else if (spId === 'yellow_watchman_goby') {
    drawWatchmanGoby(ctx, fish);
  } else {
    drawGenericFish(ctx, fish);
  }

  ctx.restore();
}

/**
 * 1. BLUE FIN (Betta splendens):
 * Distinctive upturned mouth, layered royal blue and iridescent turquoise scales,
 * majestic flowing half-moon tail, flowing anal and dorsal fins with delicate rays.
 */
function drawBetta(ctx: CanvasRenderingContext2D, f: FishInstance): void {
  const tailWave = Math.sin(f.tailPhase) * 6;
  const finFlutter = Math.cos(f.tailPhase * 1.4) * 4;

  // Flowing Caudal (Tail) Fin - Layered translucent blue & turquoise
  ctx.save();
  const tailGrad = ctx.createRadialGradient(-18, 0, 2, -35, tailWave, 32);
  tailGrad.addColorStop(0, '#1d4ed8');
  tailGrad.addColorStop(0.5, '#06b6d4');
  tailGrad.addColorStop(0.85, '#38bdf8');
  tailGrad.addColorStop(1, 'rgba(125, 211, 252, 0.4)');
  ctx.fillStyle = tailGrad;

  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.bezierCurveTo(-26, -18 + tailWave * 0.5, -42, -24 + tailWave, -48, tailWave);
  ctx.bezierCurveTo(-42, 24 + tailWave, -26, 18 + tailWave * 0.5, -16, 0);
  ctx.fill();

  // Caudal fin rays
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 0.8;
  for (let r = -3; r <= 3; r++) {
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.quadraticCurveTo(-30, r * 6 + tailWave * 0.5, -45, r * 7 + tailWave);
    ctx.stroke();
  }
  ctx.restore();

  // Flowing Dorsal Fin (Top)
  ctx.save();
  const dorsalGrad = ctx.createLinearGradient(-10, -6, -20, -26 + finFlutter);
  dorsalGrad.addColorStop(0, '#1e40af');
  dorsalGrad.addColorStop(1, '#06b6d4');
  ctx.fillStyle = dorsalGrad;
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.quadraticCurveTo(-14, -22 + finFlutter, -24, -20 + finFlutter);
  ctx.quadraticCurveTo(-18, -10, -14, -4);
  ctx.fill();
  ctx.restore();

  // Flowing Anal Fin (Bottom)
  ctx.save();
  const analGrad = ctx.createLinearGradient(-10, 6, -22, 24 + finFlutter);
  analGrad.addColorStop(0, '#1d4ed8');
  analGrad.addColorStop(1, '#22d3ee');
  ctx.fillStyle = analGrad;
  ctx.beginPath();
  ctx.moveTo(-4, 6);
  ctx.quadraticCurveTo(-12, 22 + finFlutter, -26, 18 + finFlutter);
  ctx.quadraticCurveTo(-18, 10, -15, 4);
  ctx.fill();
  ctx.restore();

  // Torpedo Body with layered iridescent scales
  const bodyGrad = ctx.createLinearGradient(16, 0, -16, 0);
  bodyGrad.addColorStop(0, '#2563eb');
  bodyGrad.addColorStop(0.4, '#0284c7');
  bodyGrad.addColorStop(0.8, '#0f766e');
  bodyGrad.addColorStop(1, '#1e3a8a');
  ctx.fillStyle = bodyGrad;

  ctx.beginPath();
  ctx.moveTo(18, -2); // upturned snout
  ctx.quadraticCurveTo(10, -8, -4, -7);
  ctx.quadraticCurveTo(-12, -5, -16, 0);
  ctx.quadraticCurveTo(-12, 5, -4, 7);
  ctx.quadraticCurveTo(10, 7, 18, 0);
  ctx.closePath();
  ctx.fill();

  // Eye (Glossy black with white pupil glint)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(12, -2, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(12.8, -2.6, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Pectoral Fin Flutter
  ctx.save();
  ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
  ctx.beginPath();
  ctx.ellipse(4, 2, 6, 2.5, 0.3 + Math.sin(f.tailPhase * 2) * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * 2. NEON TETRA (Paracheirodon innesi):
 * Slender torpedo body, iridescent cyan lateral line, glowing ruby red flank.
 */
function drawNeonTetra(ctx: CanvasRenderingContext2D, f: FishInstance): void {
  const tailWave = Math.sin(f.tailPhase) * 4;

  // Forked Tail
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.moveTo(-11, 0);
  ctx.lineTo(-19, -6 + tailWave);
  ctx.lineTo(-15, 0 + tailWave);
  ctx.lineTo(-19, 6 + tailWave);
  ctx.closePath();
  ctx.fill();

  // Body Base (Silver-translucent)
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 4.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing Iridescent Neon Blue Stripe (Upper lateral)
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(9, -1);
  ctx.lineTo(-4, -1);
  ctx.stroke();

  // Ruby Red Lower Flank
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(8, 0.5);
  ctx.lineTo(6, 3.5);
  ctx.lineTo(-8, 2);
  ctx.closePath();
  ctx.fill();

  // Eye
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(7, -1, 1.4, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 3. GUPPY (Poecilia reticulata):
 * Slender body, vibrant multicolored delta tail with fan flutter.
 */
function drawGuppy(ctx: CanvasRenderingContext2D, f: FishInstance): void {
  const tailWave = Math.sin(f.tailPhase) * 5;

  // Huge fan delta tail
  const tailGrad = ctx.createLinearGradient(-10, 0, -28, tailWave);
  tailGrad.addColorStop(0, '#f59e0b');
  tailGrad.addColorStop(0.5, '#ec4899');
  tailGrad.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = tailGrad;

  ctx.beginPath();
  ctx.moveTo(-9, 0);
  ctx.lineTo(-24, -14 + tailWave);
  ctx.quadraticCurveTo(-28, tailWave, -24, 14 + tailWave);
  ctx.closePath();
  ctx.fill();

  // Body
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.ellipse(1, 0, 10, 3.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(8, -1, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 4. PLATY (Xiphophorus maculatus):
 * Stocky bright sunset orange body.
 */
function drawPlaty(ctx: CanvasRenderingContext2D, f: FishInstance): void {
  const tailWave = Math.sin(f.tailPhase) * 3;

  // Paddle tail
  ctx.fillStyle = 'rgba(249, 115, 22, 0.7)';
  ctx.beginPath();
  ctx.moveTo(-11, 0);
  ctx.lineTo(-19, -8 + tailWave);
  ctx.lineTo(-18, 8 + tailWave);
  ctx.closePath();
  ctx.fill();

  // Stout body
  const grad = ctx.createLinearGradient(0, -7, 0, 7);
  grad.addColorStop(0, '#f97316');
  grad.addColorStop(1, '#ea580c');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(8, -1.5, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 5. HARLEQUIN RASBORA:
 * Black wedge/triangle patch on rear flank.
 */
function drawHarlequinRasbora(ctx: CanvasRenderingContext2D, f: FishInstance): void {
  const tailWave = Math.sin(f.tailPhase) * 4;

  // Forked tail
  ctx.fillStyle = 'rgba(251, 146, 60, 0.6)';
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(-18, -7 + tailWave);
  ctx.lineTo(-15, 0 + tailWave);
  ctx.lineTo(-18, 7 + tailWave);
  ctx.closePath();
  ctx.fill();

  // Copper pink-orange body
  ctx.fillStyle = '#fb923c';
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Black triangle patch
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(-9, -4);
  ctx.lineTo(-9, 4);
  ctx.closePath();
  ctx.fill();

  // Eye
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(7, -1, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 6. ZEBRA DANIO:
 * Silver-blue with crisp navy horizontal stripes.
 */
function drawZebraDanio(ctx: CanvasRenderingContext2D, f: FishInstance): void {
  const tailWave = Math.sin(f.tailPhase) * 4;

  ctx.fillStyle = 'rgba(147, 197, 253, 0.6)';
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.lineTo(-19, -6 + tailWave);
  ctx.lineTo(-19, 6 + tailWave);
  ctx.closePath();
  ctx.fill();

  // Slender body
  ctx.fillStyle = '#e0f2fe';
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Horizontal navy stripes
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 1.0;
  for (let s = -1; s <= 1; s++) {
    ctx.beginPath();
    ctx.moveTo(8, s * 1.5);
    ctx.lineTo(-10, s * 1.5);
    ctx.stroke();
  }

  // Eye
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(9, -0.8, 1.4, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 7. PANDA CORYDORAS:
 * Flat belly, whiskers/barbels, black mask over eyes, black dorsal and tail spot.
 */
function drawPandaCory(ctx: CanvasRenderingContext2D, f: FishInstance): void {
  const tailWave = Math.sin(f.tailPhase) * 3;

  // Tail with black caudal spot
  ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
  ctx.beginPath();
  ctx.moveTo(-11, 0);
  ctx.lineTo(-18, -6 + tailWave);
  ctx.lineTo(-18, 6 + tailWave);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-11, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Armored body (Cream-white)
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(12, 4); // mouth near bottom
  ctx.quadraticCurveTo(8, -6, -4, -6);
  ctx.quadraticCurveTo(-10, -4, -12, 0);
  ctx.lineTo(-10, 4);
  ctx.lineTo(12, 4); // flat belly
  ctx.closePath();
  ctx.fill();

  // Black dorsal fin
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(-2, -6);
  ctx.lineTo(-6, -14);
  ctx.lineTo(-7, -6);
  ctx.closePath();
  ctx.fill();

  // Black Eye Mask
  ctx.beginPath();
  ctx.ellipse(7, -1, 3.2, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(7.2, -1.2, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Whisker barbels
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(12, 3);
  ctx.lineTo(16, 5);
  ctx.stroke();
}

/**
 * 8. HONEY GOURAMI:
 * Warm amber gold, thread-like feeler pelvic fins.
 */
function drawHoneyGourami(ctx: CanvasRenderingContext2D, f: FishInstance): void {
  const tailWave = Math.sin(f.tailPhase) * 3.5;

  ctx.fillStyle = 'rgba(245, 158, 11, 0.6)';
  ctx.beginPath();
  ctx.moveTo(-11, 0);
  ctx.lineTo(-17, -7 + tailWave);
  ctx.lineTo(-17, 7 + tailWave);
  ctx.closePath();
  ctx.fill();

  // Golden Amber Body
  const grad = ctx.createLinearGradient(0, -7, 0, 7);
  grad.addColorStop(0, '#f59e0b');
  grad.addColorStop(1, '#d97706');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Thread-like tactile feelers (delicate sensory whiskers extending downwards)
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(4, 5);
  ctx.quadraticCurveTo(8, 16, 2, 22);
  ctx.stroke();

  // Eye
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(8, -1.5, 1.7, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 9. RED CHERRY SHRIMP:
 * Segmented curved carapace, rostrum, walking pleopods, fine antennae.
 */
function drawCherryShrimp(ctx: CanvasRenderingContext2D, f: FishInstance): void {
  // Curved segmented shrimp body
  ctx.save();
  ctx.fillStyle = 'rgba(220, 38, 38, 0.85)';

  // Head & Carapace
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(12, -2); // rostrum spike
  ctx.lineTo(7, 2);
  ctx.lineTo(-2, 3);
  ctx.lineTo(-2, -3);
  ctx.closePath();
  ctx.fill();

  // Curved Tail Segments
  ctx.beginPath();
  ctx.moveTo(-2, -3);
  ctx.quadraticCurveTo(-8, -4, -12, 2);
  ctx.quadraticCurveTo(-6, 3, -2, 3);
  ctx.fill();

  // Tiny walking legs
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 0.8;
  for (let l = 0; l < 4; l++) {
    ctx.beginPath();
    ctx.moveTo(4 - l * 2.5, 2);
    ctx.lineTo(3 - l * 2.5, 6);
    ctx.stroke();
  }

  // Antennae
  ctx.strokeStyle = '#fca5a5';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(11, -1);
  ctx.quadraticCurveTo(18, -8, 24, -10);
  ctx.stroke();
  ctx.restore();
}

/**
 * 10. OCELLARIS CLOWNFISH:
 * Vibrant orange, 3 bold white bars with black borders.
 */
function drawClownfish(ctx: CanvasRenderingContext2D, f: FishInstance): void {
  const tailWave = Math.sin(f.tailPhase) * 4;

  // Tail
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(-11, 0);
  ctx.lineTo(-18, -7 + tailWave);
  ctx.quadraticCurveTo(-19, tailWave, -18, 7 + tailWave);
  ctx.closePath();
  ctx.fill();

  // Orange Body
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3 White Vertical Bars
  const drawBar = (bx: number, wdt: number) => {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(bx - wdt / 2, -6.5, wdt, 13);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
  drawBar(6, 3.2);   // head bar
  drawBar(-1, 3.5);  // mid bar
  drawBar(-8, 2.5);  // tail bar

  // Eye
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(9, -1.8, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 11. ROYAL GRAMMA:
 * Striking half magenta-purple, half golden yellow.
 */
function drawRoyalGramma(ctx: CanvasRenderingContext2D, f: FishInstance): void {
  const tailWave = Math.sin(f.tailPhase) * 3.5;

  // Yellow Tail
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.moveTo(-11, 0);
  ctx.lineTo(-18, -6 + tailWave);
  ctx.lineTo(-18, 6 + tailWave);
  ctx.closePath();
  ctx.fill();

  // Body split
  // Rear half: yellow
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Front half: Magenta-purple
  ctx.fillStyle = '#a855f7';
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.quadraticCurveTo(8, -5.5, 0, -5.5);
  ctx.lineTo(-2, 5.5);
  ctx.quadraticCurveTo(8, 5.5, 12, 0);
  ctx.closePath();
  ctx.fill();

  // Eye
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(8, -1.2, 1.6, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 12. PAJAMA CARDINALFISH:
 * Yellowish face, dark waistband, polka dots on rear.
 */
function drawPajamaCardinal(ctx: CanvasRenderingContext2D, f: FishInstance): void {
  const tailWave = Math.sin(f.tailPhase) * 3;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(-17, -6 + tailWave);
  ctx.lineTo(-17, 6 + tailWave);
  ctx.closePath();
  ctx.fill();

  // Base body
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Yellowish green face
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.moveTo(3, -6.5);
  ctx.lineTo(12, 0);
  ctx.lineTo(3, 6.5);
  ctx.closePath();
  ctx.fill();

  // Dark waistband
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, -6.8, 3.5, 13.6);

  // Polka dots on rear flank
  ctx.fillStyle = '#78350f';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(-4 - (i % 2) * 3, -3 + Math.floor(i / 2) * 6, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Large red cardinalfish eye
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(8, -1.8, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(8, -1.8, 1.4, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 13. YELLOW WATCHMAN GOBY:
 * Canary yellow, bottom dweller resting silhouette, light blue speckles.
 */
function drawWatchmanGoby(ctx: CanvasRenderingContext2D, f: FishInstance): void {
  const tailWave = Math.sin(f.tailPhase) * 2;

  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.lineTo(-18, -5 + tailWave);
  ctx.lineTo(-18, 5 + tailWave);
  ctx.closePath();
  ctx.fill();

  // Elongated body
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cyan sparkles on cheek
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(6, -1, 0.9, 0, Math.PI * 2);
  ctx.arc(8, 1, 0.8, 0, Math.PI * 2);
  ctx.arc(4, 1.5, 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(9, -2, 1.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawGenericFish(ctx: CanvasRenderingContext2D, f: FishInstance): void {
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(7, -1, 1.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawWaterlineSurface(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  waterLevelPercent: number,
  timeSec: number,
  ripples: SurfaceRipple[]
): void {
  const waterTop = y + h * (1.0 - (waterLevelPercent / 100));

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, waterTop);

  // Surface ripples
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const px = x + (w / steps) * i;
    const wave = Math.sin(timeSec * 3 + i * 0.5) * 2.5 + Math.cos(timeSec * 2 + i * 0.8) * 1.5;
    ctx.lineTo(px, waterTop + wave);
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Food drop surface ripples
  for (const r of ripples) {
    const rx = x + r.x * w;
    const ry = waterTop;
    ctx.beginPath();
    ctx.ellipse(rx, ry, r.radius, r.radius * 0.35, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(56, 189, 248, ${r.strength})`;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  ctx.restore();
}

function drawLightingOverlay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  lighting: TankConfig['lighting']
): void {
  const { preset, lampIntensity } = lighting;
  ctx.save();

  if (preset === 'off') {
    // Genuinely dark
    ctx.fillStyle = 'rgba(2, 6, 12, 0.86)';
    ctx.fillRect(x, y, w, h);
  } else if (preset === 'midnight') {
    // Midnight Moonlight: faint silver-blue surface shimmer with dark silhouettes below
    const moonGrad = ctx.createLinearGradient(x, y, x, y + h);
    moonGrad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
    moonGrad.addColorStop(0.3, 'rgba(30, 58, 138, 0.45)');
    moonGrad.addColorStop(1, 'rgba(2, 6, 23, 0.78)');
    ctx.fillStyle = moonGrad;
    ctx.fillRect(x, y, w, h);
  } else if (preset === 'dawn') {
    // Soft apricot / pink morning glow
    const dawnGrad = ctx.createLinearGradient(x, y, x + w * 0.8, y + h);
    dawnGrad.addColorStop(0, 'rgba(251, 146, 60, 0.22)');
    dawnGrad.addColorStop(0.5, 'rgba(244, 63, 94, 0.12)');
    dawnGrad.addColorStop(1, 'rgba(15, 23, 42, 0.3)');
    ctx.fillStyle = dawnGrad;
    ctx.fillRect(x, y, w, h);
  } else if (preset === 'dusk') {
    // Warm golden-amber sunset glow
    const duskGrad = ctx.createLinearGradient(x, y, x, y + h);
    duskGrad.addColorStop(0, 'rgba(245, 158, 11, 0.28)');
    duskGrad.addColorStop(0.6, 'rgba(180, 83, 9, 0.18)');
    duskGrad.addColorStop(1, 'rgba(15, 23, 42, 0.35)');
    ctx.fillStyle = duskGrad;
    ctx.fillRect(x, y, w, h);
  } else if (preset === 'night') {
    // Dim deep night blue
    ctx.fillStyle = 'rgba(3, 15, 38, 0.65)';
    ctx.fillRect(x, y, w, h);
  } else if (preset === 'morning') {
    // Bright angled morning light
    const mGrad = ctx.createLinearGradient(x, y, x + w * 0.6, y + h);
    mGrad.addColorStop(0, 'rgba(254, 240, 138, 0.16)');
    mGrad.addColorStop(1, 'rgba(14, 165, 233, 0.05)');
    ctx.fillStyle = mGrad;
    ctx.fillRect(x, y, w, h);
  }

  // Adjust for user's lamp intensity slider (0 to 1)
  if (lampIntensity < 1.0) {
    const dimAlpha = (1.0 - lampIntensity) * 0.55;
    ctx.fillStyle = `rgba(0, 0, 0, ${dimAlpha})`;
    ctx.fillRect(x, y, w, h);
  }

  ctx.restore();
}

function drawGlassFrameAndReflections(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  shape: string,
  waterLevelPercent: number
): void {
  ctx.save();

  // Glass Frame outline
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 2.5;
  createTankClipPath(ctx, x, y, w, h, shape as any, 100);
  ctx.stroke();

  // Specular diagonal glare / glass reflection
  const glareGrad = ctx.createLinearGradient(x, y, x + w * 0.5, y + h * 0.8);
  glareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
  glareGrad.addColorStop(0.18, 'rgba(255, 255, 255, 0.04)');
  glareGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.0)');

  ctx.fillStyle = glareGrad;
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 10);
  ctx.lineTo(x + w * 0.35, y + 10);
  ctx.lineTo(x + 10, y + h * 0.65);
  ctx.closePath();
  ctx.fill();

  // Curved side specular highlights for cylinder
  if (shape === 'cylinder') {
    const sideGlow = ctx.createLinearGradient(x, y, x + 35, y);
    sideGlow.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    sideGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sideGlow;
    ctx.fillRect(x, y, 35, h);
  }

  ctx.restore();
}
