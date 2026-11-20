import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAquariumStore } from '../store/aquariumStore';
import { renderAquariumScene } from '../engine/canvasRenderer';
import { FishInfoCard } from './FishInfoCard';
import { isInsideTank } from '../utils/tankGeometry';

export const AquariumView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    currentTank,
    fishList,
    foodParticles,
    bubbles,
    ripples,
    selectedFishId,
    setSelectedFishId,
    dropFood,
    tickSimulation,
    activePanel,
    isWatchMode,
    lowEffectsMode
  } = useAquariumStore(useShallow(state => ({
    currentTank: state.currentTank,
    fishList: state.currentTank.inhabitants,
    foodParticles: state.foodParticles,
    bubbles: state.bubbles,
    ripples: state.ripples,
    selectedFishId: state.selectedFishId,
    setSelectedFishId: state.setSelectedFishId,
    dropFood: state.dropFood,
    tickSimulation: state.tickSimulation,
    activePanel: state.activePanel,
    isWatchMode: state.isWatchMode,
    lowEffectsMode: state.lowEffectsMode
  })));

  const [secondaryMarkError, setSecondaryMarkError] = useState(false);

  // Resize canvas to fill container while keeping crisp devicePixelRatio
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2 for integrated GPU efficiency

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  // Main Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop);

      // Suspend rendering when document tab is hidden
      if (document.hidden) return;

      const dt = Math.min((time - lastTime) / 1000, 0.1); // clamp delta
      lastTime = time;

      // Update simulation physics
      tickSimulation(dt, time / 1000);

      // Render 2.5D scene
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.save();
      // Reset transform before render call
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const displayW = canvas.width / dpr;
      const displayH = canvas.height / dpr;

      renderAquariumScene({
        canvas: { ...canvas, width: displayW, height: displayH } as HTMLCanvasElement,
        ctx,
        tank: currentTank,
        fishList,
        foodParticles,
        bubbles,
        ripples,
        timeSec: time / 1000,
        selectedFishId,
        lowEffectsMode
      });

      ctx.restore();
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [tickSimulation, currentTank, fishList, foodParticles, bubbles, ripples, selectedFishId, lowEffectsMode]);

  // Handle interaction (Tap/Click to feed or select fish)
  const handleInteraction = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const paddingX = Math.max(16, rect.width * 0.04);
    const paddingY = Math.max(16, rect.height * 0.05);
    const tankW = rect.width - paddingX * 2;
    const tankH = rect.height - paddingY * 2;

    const normX = (x - paddingX) / tankW;
    const normY = (y - paddingY) / tankH;

    // Check if clicked near an existing swimming fish
    let clickedFishId: string | null = null;
    let closestDist = 999;

    for (const fish of fishList) {
      const fishPxX = paddingX + fish.x * tankW;
      const fishPxY = paddingY + fish.y * tankH;
      const dist = Math.hypot(fishPxX - x, fishPxY - y);
      if (dist < 36 && dist < closestDist) {
        closestDist = dist;
        clickedFishId = fish.id;
      }
    }

    if (clickedFishId) {
      // Select the tapped fish
      setSelectedFishId(clickedFishId);
      return;
    }

    // If not clicking a fish, check if inside tank water to drop food
    if (isInsideTank(normX, normY, currentTank.shape, currentTank.waterLevelPercent) || activePanel === 'feed') {
      dropFood(Math.max(0.08, Math.min(0.92, normX)), normY);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col items-center justify-center"
    >
      {/* 2.5D Living Aquarium Canvas */}
      <canvas
        ref={canvasRef}
        onClick={e => handleInteraction(e.clientX, e.clientY)}
        onTouchStart={e => {
          if (e.touches.length > 0) {
            handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        className="cursor-pointer max-w-full max-h-full block touch-none"
      />

      {/* Selected Fish Information Overlay Card */}
      <FishInfoCard />

      {/* Discreet Secondary Branding Mark on Aquarium Stand / Frame */}
      {!isWatchMode && (
        <div className="absolute bottom-1 right-6 z-10 opacity-75 hover:opacity-100 transition-opacity pointer-events-auto">
          {!secondaryMarkError ? (
            <img
              src="./secondary_mark.svg"
              alt="PD Acqua Studio Mark"
              className="h-5 w-auto object-contain"
              onError={() => setSecondaryMarkError(true)}
            />
          ) : (
            <div className="text-[10px] font-mono tracking-widest text-slate-400 bg-aqua-950/80 px-2 py-0.5 rounded border border-panel-border/50">
              PD ACQUA WORLD
            </div>
          )}
        </div>
      )}
    </div>
  );
};
