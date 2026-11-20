import { DecorType, WaterType } from '../types';

export interface DecorCatalogItem {
  type: DecorType;
  name: string;
  category: 'wood' | 'stone' | 'plant' | 'marine_coral' | 'equipment';
  waterTypeSuitability: WaterType | 'both';
  defaultScale: number;
  description: string;
}

export const DECOR_CATALOG: DecorCatalogItem[] = [
  {
    type: 'driftwood_branch',
    name: 'Branching Driftwood',
    category: 'wood',
    waterTypeSuitability: 'freshwater',
    defaultScale: 1.0,
    description: 'Natural weathered bogwood branch that provides resting and exploring perches.'
  },
  {
    type: 'driftwood_stump',
    name: 'Ancient Bogwood Root',
    category: 'wood',
    waterTypeSuitability: 'freshwater',
    defaultScale: 1.1,
    description: 'Dense gnarled root structure with caves and swim-through channels.'
  },
  {
    type: 'broad_leaf_plant',
    name: 'Broad-Leaf Anubias Barteri',
    category: 'plant',
    waterTypeSuitability: 'freshwater',
    defaultScale: 1.0,
    description: 'Lush wide leaves positioned near the surface; ideal resting hammock for bettas.'
  },
  {
    type: 'tall_plant',
    name: 'Tall Vallisneria Spiralis',
    category: 'plant',
    waterTypeSuitability: 'freshwater',
    defaultScale: 1.2,
    description: 'Graceful ribbon leaves swaying with water flow; provides shelter for schooling fish.'
  },
  {
    type: 'smooth_stone',
    name: 'River Pebble Cluster',
    category: 'stone',
    waterTypeSuitability: 'both',
    defaultScale: 0.9,
    description: 'Water-smoothed tumbled slate and granite stones.'
  },
  {
    type: 'dragon_stone',
    name: 'Dragon Stone (Ohko)',
    category: 'stone',
    waterTypeSuitability: 'both',
    defaultScale: 1.0,
    description: 'Clay-like porous stone with intricate miniature caverns.'
  },
  {
    type: 'moss_ball',
    name: 'Marimo Moss Cushion',
    category: 'plant',
    waterTypeSuitability: 'freshwater',
    defaultScale: 0.8,
    description: 'Velvety spherical green algae ball beloved by shrimp and bottom grazers.'
  },
  {
    type: 'live_rock',
    name: 'Porous Marine Live Rock',
    category: 'stone',
    waterTypeSuitability: 'marine',
    defaultScale: 1.1,
    description: 'Calcified biological reef rock formation with micro-caves for reef fish.'
  },
  {
    type: 'marine_coral',
    name: 'Acropora Staghorn Coral',
    category: 'marine_coral',
    waterTypeSuitability: 'marine',
    defaultScale: 1.0,
    description: 'Vibrant branching stony coral with delicate polyp tips.'
  },
  {
    type: 'sea_anemone',
    name: 'Bubble-Tip Sea Anemone',
    category: 'marine_coral',
    waterTypeSuitability: 'marine',
    defaultScale: 1.0,
    description: 'Gentle undulating tentacles; classic symbiotic host for clownfish.'
  },
  {
    type: 'airstone',
    name: 'Fine Micro-Bubble Air Stone',
    category: 'equipment',
    waterTypeSuitability: 'both',
    defaultScale: 0.8,
    description: 'Aeration diffuser releasing a continuous shimmering curtain of fine bubbles.'
  }
];
