import { TankConfig } from '../types';

export function createBlueFinsHome(): TankConfig {
  // Start Blue Fin at a slightly different position each visit
  const randomX = 0.35 + (Math.random() - 0.5) * 0.3; // between 0.2 and 0.5
  const randomY = 0.3 + (Math.random() - 0.5) * 0.2;  // between 0.2 and 0.4

  return {
    id: 'blue-fins-home',
    name: "Blue Fin's Home",
    shape: 'rectangular',
    dimensions: {
      widthCm: 50,
      heightCm: 35,
      depthCm: 30
    },
    waterLevelPercent: 92,
    waterType: 'freshwater',
    substrate: 'gravel',
    background: 'planted_aqua',
    decor: [
      {
        id: 'd-anubias',
        type: 'broad_leaf_plant',
        name: 'Broad-Leaf Anubias',
        x: 0.22,
        y: 0.65, // Base on gravel, leaves reach upper surface
        scale: 1.15,
        rotation: 4,
        flipped: false,
        depthZone: 'mid'
      },
      {
        id: 'd-driftwood',
        type: 'driftwood_branch',
        name: 'Weathered Driftwood',
        x: 0.65,
        y: 0.72,
        scale: 1.25,
        rotation: -6,
        flipped: false,
        depthZone: 'back'
      },
      {
        id: 'd-stones',
        type: 'smooth_stone',
        name: 'River Stones',
        x: 0.42,
        y: 0.85,
        scale: 0.9,
        rotation: 0,
        flipped: false,
        depthZone: 'front'
      },
      {
        id: 'd-airstone',
        type: 'airstone',
        name: 'Subtle Aerator',
        x: 0.88,
        y: 0.82,
        scale: 0.75,
        rotation: 0,
        flipped: false,
        depthZone: 'back'
      }
    ],
    inhabitants: [
      {
        id: 'blue-fin-1',
        speciesId: 'betta',
        name: 'Blue Fin',
        x: randomX,
        y: randomY,
        vx: 0.0003,
        vy: 0.0001,
        heading: 0.2,
        targetHeading: 0.2,
        speed: 0.0004,
        baseSpeed: 0.0004,
        bodyFlex: 0,
        tailPhase: 0,
        behavior: 'cruising',
        targetFoodId: null,
        stateTimer: 60,
        hunger: 35,
        health: 100,
        depthZ: 0.55
      }
    ],
    equipment: {
      heaterEnabled: true,
      heaterTargetTemp: 26.0,
      measuredTemp: 26.0,
      roomTemp: 21.0,
      filterEnabled: true,
      filterFlowStrength: 0.25, // Bettas prefer calm waters
      aerationEnabled: true,
      aerationStrength: 0.35,
      simSpeed: 1
    },
    lighting: {
      preset: 'afternoon',
      manualClockHours: 14.5,
      autoCycle: false,
      lampIntensity: 0.9
    },
    leftoversCount: 0,
    clarityPercent: 98,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

export function createTropicalCommunityPreset(): TankConfig {
  return {
    id: 'tropical-community',
    name: 'Tropical Community Aquarium',
    shape: 'panoramic',
    dimensions: {
      widthCm: 100,
      heightCm: 45,
      depthCm: 40
    },
    waterLevelPercent: 90,
    waterType: 'freshwater',
    substrate: 'sand',
    background: 'deep_blue',
    decor: [
      {
        id: 'tc-wood',
        type: 'driftwood_branch',
        name: 'Centerpiece Driftwood',
        x: 0.5,
        y: 0.68,
        scale: 1.3,
        rotation: 0,
        flipped: false,
        depthZone: 'mid'
      },
      {
        id: 'tc-tall-1',
        type: 'tall_plant',
        name: 'Background Vallisneria',
        x: 0.15,
        y: 0.6,
        scale: 1.3,
        rotation: -4,
        flipped: false,
        depthZone: 'back'
      },
      {
        id: 'tc-tall-2',
        type: 'tall_plant',
        name: 'Background Vallisneria Right',
        x: 0.82,
        y: 0.62,
        scale: 1.25,
        rotation: 6,
        flipped: true,
        depthZone: 'back'
      },
      {
        id: 'tc-stone',
        type: 'smooth_stone',
        name: 'River Pebbles',
        x: 0.32,
        y: 0.84,
        scale: 1.0,
        rotation: 0,
        flipped: false,
        depthZone: 'front'
      },
      {
        id: 'tc-air',
        type: 'airstone',
        name: 'Air Stone',
        x: 0.92,
        y: 0.82,
        scale: 0.8,
        rotation: 0,
        flipped: false,
        depthZone: 'back'
      }
    ],
    inhabitants: [
      // School of 8 Neon Tetras
      ...Array.from({ length: 8 }).map((_, i) => ({
        id: `neon-${i + 1}`,
        speciesId: 'neon_tetra',
        name: `Neon #${i + 1}`,
        x: 0.3 + (i % 4) * 0.08 + Math.random() * 0.04,
        y: 0.35 + Math.floor(i / 4) * 0.08 + Math.random() * 0.04,
        vx: 0.0007,
        vy: 0.0001,
        heading: 0,
        targetHeading: 0,
        speed: 0.0008,
        baseSpeed: 0.0008,
        bodyFlex: 0,
        tailPhase: Math.random() * Math.PI * 2,
        behavior: 'schooling' as const,
        targetFoodId: null,
        stateTimer: 100,
        hunger: 40,
        health: 100,
        depthZ: 0.4 + (i * 0.05)
      })),
      // 3 Guppies
      {
        id: 'guppy-1',
        speciesId: 'guppy',
        name: 'Flash',
        x: 0.65,
        y: 0.22,
        vx: 0.0005,
        vy: 0.0001,
        heading: 0.3,
        targetHeading: 0.3,
        speed: 0.0006,
        baseSpeed: 0.0006,
        bodyFlex: 0,
        tailPhase: 0,
        behavior: 'cruising' as const,
        targetFoodId: null,
        stateTimer: 80,
        hunger: 30,
        health: 100,
        depthZ: 0.6
      },
      {
        id: 'guppy-2',
        speciesId: 'guppy',
        name: 'Sunny',
        x: 0.72,
        y: 0.26,
        vx: -0.0004,
        vy: 0.0002,
        heading: Math.PI,
        targetHeading: Math.PI,
        speed: 0.0005,
        baseSpeed: 0.0005,
        bodyFlex: 0,
        tailPhase: 1,
        behavior: 'cruising' as const,
        targetFoodId: null,
        stateTimer: 60,
        hunger: 25,
        health: 100,
        depthZ: 0.65
      },
      // 4 Panda Corydoras (bottom dwellers)
      ...Array.from({ length: 4 }).map((_, i) => ({
        id: `cory-${i + 1}`,
        speciesId: 'panda_cory',
        name: ['Dot', 'Pebble', 'Paws', 'Sandy'][i],
        x: 0.25 + i * 0.16 + Math.random() * 0.05,
        y: 0.82 + Math.random() * 0.04,
        vx: 0.0004,
        vy: 0,
        heading: 0,
        targetHeading: 0,
        speed: 0.0005,
        baseSpeed: 0.0005,
        bodyFlex: 0,
        tailPhase: 0,
        behavior: 'exploring' as const,
        targetFoodId: null,
        stateTimer: 90,
        hunger: 45,
        health: 100,
        depthZ: 0.7
      }))
    ],
    equipment: {
      heaterEnabled: true,
      heaterTargetTemp: 24.5,
      measuredTemp: 24.5,
      roomTemp: 21.0,
      filterEnabled: true,
      filterFlowStrength: 0.6,
      aerationEnabled: true,
      aerationStrength: 0.6,
      simSpeed: 1
    },
    lighting: {
      preset: 'morning',
      manualClockHours: 9.5,
      autoCycle: false,
      lampIntensity: 0.85
    },
    leftoversCount: 0,
    clarityPercent: 96,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

export function createPlantedShrimpPreset(): TankConfig {
  return {
    id: 'planted-shrimp',
    name: 'Planted Nature Shrimp Tank',
    shape: 'shallow',
    dimensions: {
      widthCm: 60,
      heightCm: 30,
      depthCm: 30
    },
    waterLevelPercent: 88,
    waterType: 'freshwater',
    substrate: 'dark_soil',
    background: 'planted_aqua',
    decor: [
      {
        id: 'ps-wood',
        type: 'driftwood_stump',
        name: 'Gnarled Root Base',
        x: 0.4,
        y: 0.68,
        scale: 1.2,
        rotation: 5,
        flipped: false,
        depthZone: 'mid'
      },
      {
        id: 'ps-moss-1',
        type: 'moss_ball',
        name: 'Marimo Moss',
        x: 0.22,
        y: 0.82,
        scale: 0.9,
        rotation: 0,
        flipped: false,
        depthZone: 'front'
      },
      {
        id: 'ps-moss-2',
        type: 'moss_ball',
        name: 'Marimo Moss Small',
        x: 0.65,
        y: 0.84,
        scale: 0.7,
        rotation: 0,
        flipped: false,
        depthZone: 'front'
      },
      {
        id: 'ps-anubias',
        type: 'broad_leaf_plant',
        name: 'Petite Anubias',
        x: 0.78,
        y: 0.68,
        scale: 1.0,
        rotation: -3,
        flipped: false,
        depthZone: 'mid'
      }
    ],
    inhabitants: Array.from({ length: 8 }).map((_, i) => ({
      id: `shrimp-${i + 1}`,
      speciesId: 'cherry_shrimp',
      name: ['Ruby', 'Coral', 'Berry', 'Cherry', 'Blaze', 'Flare', 'Spark', 'Pip'][i],
      x: 0.15 + i * 0.1 + (Math.random() - 0.5) * 0.05,
      y: 0.75 + (Math.random() - 0.5) * 0.12,
      vx: 0.0002,
      vy: 0.0001,
      heading: Math.random() * Math.PI * 2,
      targetHeading: 0,
      speed: 0.0003,
      baseSpeed: 0.0003,
      bodyFlex: 0,
      tailPhase: 0,
      behavior: 'grazing' as const,
      targetFoodId: null,
      stateTimer: 60 + Math.floor(Math.random() * 60),
      hunger: 30,
      health: 100,
      depthZ: 0.5 + Math.random() * 0.3
    })),
    equipment: {
      heaterEnabled: true,
      heaterTargetTemp: 22.0,
      measuredTemp: 22.0,
      roomTemp: 21.0,
      filterEnabled: true,
      filterFlowStrength: 0.3,
      aerationEnabled: true,
      aerationStrength: 0.4,
      simSpeed: 1
    },
    lighting: {
      preset: 'afternoon',
      manualClockHours: 13.0,
      autoCycle: false,
      lampIntensity: 0.95
    },
    leftoversCount: 0,
    clarityPercent: 99,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

export function createMarineReefPreset(): TankConfig {
  return {
    id: 'marine-reef',
    name: 'Living Coral Reef Oasis',
    shape: 'bowfront',
    dimensions: {
      widthCm: 90,
      heightCm: 50,
      depthCm: 45
    },
    waterLevelPercent: 92,
    waterType: 'marine',
    substrate: 'coral_sand',
    background: 'deep_blue',
    decor: [
      {
        id: 'mr-rock-1',
        type: 'live_rock',
        name: 'Live Rock Formation',
        x: 0.32,
        y: 0.65,
        scale: 1.3,
        rotation: 0,
        flipped: false,
        depthZone: 'back'
      },
      {
        id: 'mr-coral-1',
        type: 'marine_coral',
        name: 'Staghorn Coral',
        x: 0.42,
        y: 0.56,
        scale: 1.1,
        rotation: 5,
        flipped: false,
        depthZone: 'mid'
      },
      {
        id: 'mr-anemone',
        type: 'sea_anemone',
        name: 'Bubble Anemone',
        x: 0.68,
        y: 0.68,
        scale: 1.2,
        rotation: 0,
        flipped: false,
        depthZone: 'mid'
      },
      {
        id: 'mr-airstone',
        type: 'airstone',
        name: 'Protein Aerator',
        x: 0.9,
        y: 0.8,
        scale: 0.8,
        rotation: 0,
        flipped: false,
        depthZone: 'back'
      }
    ],
    inhabitants: [
      {
        id: 'clown-1',
        speciesId: 'ocellaris_clownfish',
        name: 'Marlin',
        x: 0.62,
        y: 0.55,
        vx: 0.0006,
        vy: 0.0002,
        heading: 0.5,
        targetHeading: 0.5,
        speed: 0.0006,
        baseSpeed: 0.0006,
        bodyFlex: 0,
        tailPhase: 0,
        behavior: 'cruising',
        targetFoodId: null,
        stateTimer: 70,
        hunger: 35,
        health: 100,
        depthZ: 0.6
      },
      {
        id: 'clown-2',
        speciesId: 'ocellaris_clownfish',
        name: 'Coral',
        x: 0.68,
        y: 0.58,
        vx: 0.0005,
        vy: -0.0002,
        heading: -0.4,
        targetHeading: -0.4,
        speed: 0.0005,
        baseSpeed: 0.0005,
        bodyFlex: 0,
        tailPhase: 1.5,
        behavior: 'cruising',
        targetFoodId: null,
        stateTimer: 60,
        hunger: 40,
        health: 100,
        depthZ: 0.65
      },
      {
        id: 'royal-1',
        speciesId: 'royal_gramma',
        name: 'Violet',
        x: 0.35,
        y: 0.48,
        vx: 0.0004,
        vy: 0.0001,
        heading: 0.2,
        targetHeading: 0.2,
        speed: 0.0005,
        baseSpeed: 0.0005,
        bodyFlex: 0,
        tailPhase: 0.8,
        behavior: 'exploring',
        targetFoodId: null,
        stateTimer: 85,
        hunger: 30,
        health: 100,
        depthZ: 0.5
      },
      {
        id: 'pajama-1',
        speciesId: 'pajama_cardinalfish',
        name: 'Pajama Prince',
        x: 0.5,
        y: 0.38,
        vx: 0.0003,
        vy: 0,
        heading: 0,
        targetHeading: 0,
        speed: 0.0004,
        baseSpeed: 0.0004,
        bodyFlex: 0,
        tailPhase: 2.1,
        behavior: 'cruising',
        targetFoodId: null,
        stateTimer: 90,
        hunger: 35,
        health: 100,
        depthZ: 0.45
      },
      {
        id: 'goby-1',
        speciesId: 'yellow_watchman_goby',
        name: 'Barnaby',
        x: 0.25,
        y: 0.84,
        vx: 0.0003,
        vy: 0,
        heading: 0.1,
        targetHeading: 0.1,
        speed: 0.0004,
        baseSpeed: 0.0004,
        bodyFlex: 0,
        tailPhase: 0,
        behavior: 'resting',
        targetFoodId: null,
        stateTimer: 110,
        hunger: 40,
        health: 100,
        depthZ: 0.75
      }
    ],
    equipment: {
      heaterEnabled: true,
      heaterTargetTemp: 25.5,
      measuredTemp: 25.5,
      roomTemp: 21.0,
      filterEnabled: true,
      filterFlowStrength: 0.75, // Strong reef wave current
      aerationEnabled: true,
      aerationStrength: 0.7,
      simSpeed: 1
    },
    lighting: {
      preset: 'afternoon',
      manualClockHours: 12.0,
      autoCycle: false,
      lampIntensity: 1.0
    },
    leftoversCount: 0,
    clarityPercent: 99,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

export function createEmptyCustomTank(): TankConfig {
  return {
    id: `custom-tank-${Date.now()}`,
    name: 'My Custom Aquascape',
    shape: 'cube',
    dimensions: {
      widthCm: 45,
      heightCm: 45,
      depthCm: 45
    },
    waterLevelPercent: 90,
    waterType: 'freshwater',
    substrate: 'sand',
    background: 'deep_blue',
    decor: [],
    inhabitants: [],
    equipment: {
      heaterEnabled: true,
      heaterTargetTemp: 25.0,
      measuredTemp: 25.0,
      roomTemp: 21.0,
      filterEnabled: true,
      filterFlowStrength: 0.5,
      aerationEnabled: true,
      aerationStrength: 0.5,
      simSpeed: 1
    },
    lighting: {
      preset: 'afternoon',
      manualClockHours: 14.0,
      autoCycle: false,
      lampIntensity: 0.9
    },
    leftoversCount: 0,
    clarityPercent: 100,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}
