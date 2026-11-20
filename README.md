# PD Acqua World — Living Aquarium Simulator

A tranquil, realistic, interactive 2.5D underwater aquarium simulator built with **React**, **TypeScript**, **Tailwind CSS**, and high-performance **HTML5 Canvas** rendering. Designed to run smoothly (60 FPS) on integrated-graphics Windows laptops and mobile browsers.

---

## 🌊 Key Features

1. **Opening Experience — "Blue Fin's Home"**
   - Direct launch into a living, planted freshwater aquarium with **Blue Fin**, an authentic blue Betta splendens with layered turquoise scales, flowing translucent fins, and realistic behavior (pauses under broad leaves, fans fins, rises to the surface to breathe atmospheric oxygen).
   - Starts at a randomized valid position on every visit.

2. **Interactive Feeding Station**
   - Four distinct diet types: **Floating Pellets**, **Slow-Sinking Granules**, **Crisp Flakes**, and **Sinking Wafers**.
   - Configurable portion size, particle size, and persistent colors (Natural Brown, Ruby Red, Vibrant Orange, Spirulina Green, Golden Yellow, or custom hex color picker).
   - Tap/click anywhere in the water to drop food with surface ripples; fish dynamically sense, turn, and eat particles with bite sounds.
   - Siphoning action ("Remove leftovers") clears uneaten gravel waste and restores water clarity.

3. **Diurnal Lighting & Atmosphere**
   - 7 atmospheric moods: **Dawn**, **Morning**, **Afternoon**, **Dusk**, **Night**, **Midnight Moonlight**, and **Lights Off**.
   - 24-hour solar clock slider, automated day/night cycles, and adjustable lamp intensity.
   - Animated sunlight caustics dancing on substrate and water surface waves.

4. **10 Distinct Tank Architectures & Volume Engine**
   - Supported geometries: **Round Bowl**, **Cylindrical Column**, **Cube**, **Rectangular Tank**, **Long Panoramic**, **Shallow Planted**, **Tall Portrait**, **Bow-Front**, **Hexagonal Prism**, and **Corner Angled Prism**.
   - Exact mathematical usable volume calculation in Liters with explicit approximation labels.
   - Swimming paths, food particles, bubbles, and decorations are strictly clipped to the physical interior of the selected tank geometry.

5. **Species Library & Care Compendium (13 Identifiable Animals)**
   - **Freshwater**: Siamese Fighting Fish (Betta), Neon Tetra, Guppy, Platy, Harlequin Rasbora, Zebra Danio, Panda Corydoras, Honey Gourami, Red Cherry Shrimp.
   - **Marine (Saltwater)**: Ocellaris Clownfish, Royal Gramma, Pajama Cardinalfish, Yellow Watchman Goby.
   - Verified care parameters (temperature ranges, social behaviors, schooling minimums, swimming zones, diets, and source links to Seriously Fish, FishBase, and Reef App).
   - Compatibility engine prevents freshwater/marine mixing and flags territorial or bioload conflicts.
   - Tap any swimming fish to open its live real-time activity card (cruising, schooling, approaching food, resting, surfacing for air).

6. **Life Support & Thermal Dynamics**
   - Separate measured temperature vs. heater thermostat target with gradual thermal inertia.
   - Turning off heater lets the tank drift toward ambient room temperature (21°C).
   - Flow powerhead controls plant sway and suspended food drift.
   - Aeration air stone releases rising micro-bubble streams.
   - Simulation velocity controls: **Pause (0×)**, **1× Normal**, **5× Fast**.

7. **Aquascaping Studio**
   - Place, drag, scale, rotate, flip, and layer driftwood, river stones, broad-leaf Anubias, tall Vallisneria ribbons, live marine rocks, staghorn corals, and sea anemones.
   - Full **Undo** support for last edits.

8. **Local Persistence & Watch Mode**
   - Save multiple named aquariums locally in localStorage.
   - Duplicate, rename, reload, or delete saved aquariums with confirmation.
   - Fullscreen **Watch Mode** with discreet exit button and keyboard shortcuts (`W`, `F`, `L`, `M`, `Esc`).

---

## 🚀 Launch Instructions

### Prerequisites
- Node.js (v18+)

### Development Server
```bash
# Navigate to project directory
cd "C:\Users\Prasanna das\.gemini\antigravity\scratch\pd-acqua-world"

# Start the Vite development server
npm run dev
```
Open your browser at `http://localhost:3000` (or the port displayed in your terminal).

### Production Build & Preview
```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

### Running Test Suite
```bash
npm test
```

---

## 🎨 Logo & Branding Asset Locations

Custom logo assets can be placed in:
- **Primary Header Logo**: `public/logo.svg` (or `public/logo.png`)
  - Displays in the main header navigation. If replaced, the application automatically preserves proportions, clean spacing, and transparency.
- **Secondary Mark / Frame Badge**: `public/secondary_mark.svg` (or `public/secondary_mark.png`)
  - Displays discreetly on the lower-right aquarium stand/frame.
- **Fallback**: If custom images are not present, elegant typographic vector branding renders automatically.

---

## ✅ Verified User Journeys Summary

All 7 core user journeys were programmatically verified through Vitest integration tests and interactive simulation checks:

1. **Journey 1: Blue Fin’s Home & Feeding** — Opened into Blue Fin's planted habitat, selected orange floating pellets, tapped left water, and verified Blue Fin approached and ate the pellet.
2. **Journey 2: Panoramic Tank & Schooling** — Created a panoramic freshwater tank, introduced a school of Neon Tetras, placed driftwood, and confirmed the school smoothly navigated around the wood boundary and regrouped.
3. **Journey 3: Tank Geometry Switching & Interior Clipping** — Switched between round bowl, cube, cylinder, and hexagonal tanks; verified that fish, food, and bubbles remained strictly constrained to each geometry's interior.
4. **Journey 4: Thermal Inertia & Simulation Speeds** — Set heater target above current temp, accelerated to 5× speed to observe rapid gradual warming, and paused (0×) to confirm simulation time and temperature changes stopped.
5. **Journey 5: Diurnal Lighting & Watch Mode** — Transitioned seamlessly from Afternoon to Midnight Moonlight, entered Watch mode (hiding UI controls), and exited cleanly back to editing.
6. **Journey 6: Local Persistence & Tank Reloading** — Renamed fish, customized equipment and lighting, saved the snapshot to localStorage, reloaded the tank, and confirmed all parameters restored intact.
7. **Journey 7: Mobile Touch & Species Inspection** — Verified responsive touch controls, tapped swimming fish to view real-time activity and care details without pausing, and adjusted lighting using touch-sized targets.
