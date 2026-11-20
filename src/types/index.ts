export type TankShape =
  | 'bowl'
  | 'cylinder'
  | 'cube'
  | 'rectangular'
  | 'panoramic'
  | 'shallow'
  | 'portrait'
  | 'bowfront'
  | 'hexagonal'
  | 'corner';

export type WaterType = 'freshwater' | 'marine';

export type SubstrateType = 'sand' | 'gravel' | 'dark_soil' | 'coral_sand';

export type BackgroundType =
  | 'deep_blue'
  | 'planted_aqua'
  | 'midnight_black'
  | 'slate_rock'
  | 'horizon_gradient'
  | 'frosted_glass';

export type FoodType = 'pellets' | 'granules' | 'flakes' | 'wafers';
export type FoodPortion = 'pinch' | 'medium' | 'generous';
export type FoodParticleSize = 'tiny' | 'medium' | 'large';

export interface FoodParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: FoodType;
  size: number;
  color: string;
  floatState: 'floating' | 'sinking' | 'rest';
  wobblePhase: number;
  decay: number; // 0 to 1 (leftover decay)
  eaten: boolean;
}

export type SwimmingZone = 'surface' | 'midwater' | 'bottom' | 'all';
export type SocialType = 'solitary' | 'schooling' | 'peaceful_pair' | 'bottom_dweller' | 'invertebrate';
export type DietType = 'omnivore' | 'herbivore' | 'carnivore';

export interface SpeciesSource {
  title: string;
  url: string;
}

export interface SpeciesData {
  id: string;
  commonName: string;
  scientificName: string;
  habitat: WaterType;
  adultSizeCm: number;
  minTempC: number;
  maxTempC: number;
  socialBehavior: SocialType;
  minGroupSize: number;
  preferredZone: SwimmingZone;
  diet: DietType;
  interestingFact: string;
  sources: SpeciesSource[];
  verified: boolean;
  minVolumeLiters: number;
  aggressionLevel: 'peaceful' | 'semi-aggressive' | 'territorial';
  primaryColor: string;
  secondaryColor: string;
}

export type FishBehavior =
  | 'cruising'
  | 'turning'
  | 'resting'
  | 'exploring'
  | 'approaching_food'
  | 'eating'
  | 'returning_to_zone'
  | 'rising_for_air'
  | 'schooling'
  | 'grazing';

export interface FishInstance {
  id: string;
  speciesId: string;
  name: string;
  x: number; // 0..1 relative to tank bounds
  y: number; // 0..1 relative to tank bounds
  vx: number;
  vy: number;
  heading: number; // radians
  targetHeading: number;
  speed: number;
  baseSpeed: number;
  bodyFlex: number;
  tailPhase: number;
  behavior: FishBehavior;
  targetFoodId: string | null;
  stateTimer: number;
  hunger: number; // 0 = full, 100 = starving
  health: number; // 100 max
  depthZ: number; // 0 = back, 1 = front for 2.5D rendering
  restSpot?: { x: number; y: number };
}

export type DecorType =
  | 'driftwood_branch'
  | 'driftwood_stump'
  | 'smooth_stone'
  | 'dragon_stone'
  | 'broad_leaf_plant'
  | 'tall_plant'
  | 'moss_ball'
  | 'marine_coral'
  | 'sea_anemone'
  | 'live_rock'
  | 'airstone';

export interface DecorItem {
  id: string;
  type: DecorType;
  name: string;
  x: number; // 0..1 relative to tank bounds
  y: number; // 0..1 relative to tank bounds
  scale: number;
  rotation: number; // degrees
  flipped: boolean;
  depthZone: 'back' | 'mid' | 'front';
}

export interface EquipmentState {
  heaterEnabled: boolean;
  heaterTargetTemp: number; // °C
  measuredTemp: number;     // °C
  roomTemp: number;         // °C
  filterEnabled: boolean;
  filterFlowStrength: number; // 0..1
  aerationEnabled: boolean;
  aerationStrength: number;   // 0..1
  simSpeed: 0 | 1 | 5;
}

export type LightingPreset =
  | 'dawn'
  | 'morning'
  | 'afternoon'
  | 'dusk'
  | 'night'
  | 'midnight'
  | 'off';

export interface LightingState {
  preset: LightingPreset;
  manualClockHours: number; // 0..24
  autoCycle: boolean;
  lampIntensity: number;    // 0..1
}

export interface TankDimensions {
  widthCm: number;
  heightCm: number;
  depthCm: number;
}

export interface TankConfig {
  id: string;
  name: string;
  shape: TankShape;
  dimensions: TankDimensions;
  waterLevelPercent: number; // e.g. 90%
  waterType: WaterType;
  substrate: SubstrateType;
  background: BackgroundType;
  decor: DecorItem[];
  inhabitants: FishInstance[];
  equipment: EquipmentState;
  lighting: LightingState;
  leftoversCount: number;
  clarityPercent: number; // 0..100
  createdAt: number;
  updatedAt: number;
}

export interface Bubble {
  id: string;
  x: number;
  y: number;
  radius: number;
  vy: number;
  vx: number;
  wobblePhase: number;
  wobbleSpeed: number;
  source: 'airstone' | 'fish_breath' | 'surface_splash';
}

export interface SurfaceRipple {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
  age: number;
}
