import { SpeciesData } from '../types';

export const SPECIES_CATALOG: SpeciesData[] = [
  // --- FRESHWATER ---
  {
    id: 'betta',
    commonName: 'Siamese Fighting Fish (Betta)',
    scientificName: 'Betta splendens',
    habitat: 'freshwater',
    adultSizeCm: 7.0,
    minTempC: 24,
    maxTempC: 30,
    socialBehavior: 'solitary',
    minGroupSize: 1,
    preferredZone: 'surface',
    diet: 'carnivore',
    interestingFact: 'Possesses a labyrinth organ that lets it breathe atmospheric oxygen directly from the water surface, making surface access vital.',
    sources: [
      { title: 'Seriously Fish — Betta splendens', url: 'https://www.seriouslyfish.com/species/betta-splendens/' },
      { title: 'FishBase — Betta splendens', url: 'https://www.fishbase.se/summary/Betta-splendens.html' }
    ],
    verified: true,
    minVolumeLiters: 19, // ~5 gallons recommended minimum
    aggressionLevel: 'territorial',
    primaryColor: '#1d4ed8', // Royal Blue
    secondaryColor: '#06b6d4' // Turquoise sheen
  },
  {
    id: 'neon_tetra',
    commonName: 'Neon Tetra',
    scientificName: 'Paracheirodon innesi',
    habitat: 'freshwater',
    adultSizeCm: 3.5,
    minTempC: 20,
    maxTempC: 26,
    socialBehavior: 'schooling',
    minGroupSize: 6,
    preferredZone: 'midwater',
    diet: 'omnivore',
    interestingFact: 'Iridescent blue stripe is produced by structural guanine crystals in specialized iridophore cells that scatter light in blackwater streams.',
    sources: [
      { title: 'Seriously Fish — Paracheirodon innesi', url: 'https://www.seriouslyfish.com/species/paracheirodon-innesi/' },
      { title: 'FishBase — Paracheirodon innesi', url: 'https://www.fishbase.se/summary/Paracheirodon-innesi.html' }
    ],
    verified: true,
    minVolumeLiters: 38,
    aggressionLevel: 'peaceful',
    primaryColor: '#06b6d4', // Bright cyan-blue
    secondaryColor: '#ef4444' // Ruby red lower flank
  },
  {
    id: 'guppy',
    commonName: 'Guppy / Millions Fish',
    scientificName: 'Poecilia reticulata',
    habitat: 'freshwater',
    adultSizeCm: 4.5,
    minTempC: 22,
    maxTempC: 28,
    socialBehavior: 'schooling',
    minGroupSize: 3,
    preferredZone: 'surface',
    diet: 'omnivore',
    interestingFact: 'Famous for extreme sexual dimorphism and magnificent delta tails; females give birth to active, free-swimming live fry.',
    sources: [
      { title: 'Seriously Fish — Poecilia reticulata', url: 'https://www.seriouslyfish.com/species/poecilia-reticulata/' },
      { title: 'FishBase — Poecilia reticulata', url: 'https://www.fishbase.se/summary/Poecilia-reticulata.html' }
    ],
    verified: true,
    minVolumeLiters: 30,
    aggressionLevel: 'peaceful',
    primaryColor: '#f59e0b', // Golden yellow
    secondaryColor: '#ec4899' // Rainbow magenta tail
  },
  {
    id: 'platy',
    commonName: 'Southern Platyfish',
    scientificName: 'Xiphophorus maculatus',
    habitat: 'freshwater',
    adultSizeCm: 5.0,
    minTempC: 20,
    maxTempC: 26,
    socialBehavior: 'schooling',
    minGroupSize: 3,
    preferredZone: 'midwater',
    diet: 'omnivore',
    interestingFact: 'Active grazer that constantly nibbles fine algae off plants and stones; very adaptable and hardy livebearer.',
    sources: [
      { title: 'Seriously Fish — Xiphophorus maculatus', url: 'https://www.seriouslyfish.com/species/xiphophorus-maculatus/' },
      { title: 'FishBase — Xiphophorus maculatus', url: 'https://www.fishbase.se/summary/Xiphophorus-maculatus.html' }
    ],
    verified: true,
    minVolumeLiters: 40,
    aggressionLevel: 'peaceful',
    primaryColor: '#ea580c', // Bright Sunset Orange
    secondaryColor: '#f97316'
  },
  {
    id: 'harlequin_rasbora',
    commonName: 'Harlequin Rasbora',
    scientificName: 'Trigonostigma heteromorpha',
    habitat: 'freshwater',
    adultSizeCm: 4.0,
    minTempC: 22,
    maxTempC: 28,
    socialBehavior: 'schooling',
    minGroupSize: 8,
    preferredZone: 'midwater',
    diet: 'omnivore',
    interestingFact: 'Features a distinctive jet-black triangular patch expanding from mid-body to caudal fin, aiding synchronized school cohesion.',
    sources: [
      { title: 'Seriously Fish — Trigonostigma heteromorpha', url: 'https://www.seriouslyfish.com/species/trigonostigma-heteromorpha/' },
      { title: 'FishBase — Trigonostigma heteromorpha', url: 'https://www.fishbase.se/summary/Trigonostigma-heteromorpha.html' }
    ],
    verified: true,
    minVolumeLiters: 45,
    aggressionLevel: 'peaceful',
    primaryColor: '#fb923c', // Copper pink-orange
    secondaryColor: '#1e293b' // Black triangle
  },
  {
    id: 'zebra_danio',
    commonName: 'Zebra Danio',
    scientificName: 'Danio rerio',
    habitat: 'freshwater',
    adultSizeCm: 4.5,
    minTempC: 18,
    maxTempC: 25,
    socialBehavior: 'schooling',
    minGroupSize: 6,
    preferredZone: 'surface',
    diet: 'omnivore',
    interestingFact: 'A key model organism in biomedical genetics; energetic swimmer that dart effortlessly against fast water current.',
    sources: [
      { title: 'Seriously Fish — Danio rerio', url: 'https://www.seriouslyfish.com/species/danio-rerio/' },
      { title: 'FishBase — Danio rerio', url: 'https://www.fishbase.se/summary/Danio-rerio.html' }
    ],
    verified: true,
    minVolumeLiters: 40,
    aggressionLevel: 'peaceful',
    primaryColor: '#93c5fd', // Silver blue
    secondaryColor: '#1e3a8a' // Navy horizontal stripes
  },
  {
    id: 'panda_cory',
    commonName: 'Panda Corydoras',
    scientificName: 'Corydoras panda',
    habitat: 'freshwater',
    adultSizeCm: 4.5,
    minTempC: 20,
    maxTempC: 25,
    socialBehavior: 'bottom_dweller',
    minGroupSize: 4,
    preferredZone: 'bottom',
    diet: 'omnivore',
    interestingFact: 'Equipped with sensitive whisker-like sensory barbels used to sift through sand and fine gravel for sunken morsels.',
    sources: [
      { title: 'Seriously Fish — Corydoras panda', url: 'https://www.seriouslyfish.com/species/corydoras-panda/' },
      { title: 'FishBase — Corydoras panda', url: 'https://www.fishbase.se/summary/Corydoras-panda.html' }
    ],
    verified: true,
    minVolumeLiters: 50,
    aggressionLevel: 'peaceful',
    primaryColor: '#f1f5f9', // Pale cream
    secondaryColor: '#0f172a' // Jet-black eye mask and tail spot
  },
  {
    id: 'honey_gourami',
    commonName: 'Honey Gourami',
    scientificName: 'Trichogaster chuna',
    habitat: 'freshwater',
    adultSizeCm: 5.0,
    minTempC: 23,
    maxTempC: 28,
    socialBehavior: 'peaceful_pair',
    minGroupSize: 2,
    preferredZone: 'midwater',
    diet: 'omnivore',
    interestingFact: 'Modifies pelvic fins into delicate thread-like tactile feelers loaded with taste and touch sensory receptors.',
    sources: [
      { title: 'Seriously Fish — Trichogaster chuna', url: 'https://www.seriouslyfish.com/species/trichogaster-chuna/' },
      { title: 'FishBase — Trichogaster chuna', url: 'https://www.fishbase.se/summary/Trichogaster-chuna.html' }
    ],
    verified: true,
    minVolumeLiters: 40,
    aggressionLevel: 'peaceful',
    primaryColor: '#f59e0b', // Warm amber-honey
    secondaryColor: '#d97706'
  },
  {
    id: 'cherry_shrimp',
    commonName: 'Red Cherry Shrimp',
    scientificName: 'Neocaridina davidi',
    habitat: 'freshwater',
    adultSizeCm: 2.5,
    minTempC: 18,
    maxTempC: 27,
    socialBehavior: 'invertebrate',
    minGroupSize: 5,
    preferredZone: 'bottom',
    diet: 'herbivore',
    interestingFact: 'Tireless micro-cleaner that constantly rotates tiny chelae claws to graze biofilm and microscopic algae from plants and hardscape.',
    sources: [
      { title: 'IUCN Red List — Neocaridina davidi', url: 'https://www.iucnredlist.org' },
      { title: 'Aquarium Co-Op — Cherry Shrimp Care', url: 'https://www.aquariumcoop.com/blogs/aquarium/cherry-shrimp-care' }
    ],
    verified: true,
    minVolumeLiters: 15,
    aggressionLevel: 'peaceful',
    primaryColor: '#dc2626', // Bright translucent scarlet
    secondaryColor: '#b91c1c'
  },

  // --- MARINE (SALTWATER) ---
  {
    id: 'ocellaris_clownfish',
    commonName: 'Ocellaris Clownfish (False Percula)',
    scientificName: 'Amphiprion ocellaris',
    habitat: 'marine',
    adultSizeCm: 9.0,
    minTempC: 24,
    maxTempC: 28,
    socialBehavior: 'peaceful_pair',
    minGroupSize: 2,
    preferredZone: 'midwater',
    diet: 'omnivore',
    interestingFact: 'Produces a protective mucus coat that immunizes it against the stinging nematocysts of symbiotic sea anemones.',
    sources: [
      { title: 'FishBase — Amphiprion ocellaris', url: 'https://www.fishbase.se/summary/Amphiprion-ocellaris.html' },
      { title: 'Reef App — Amphiprion ocellaris', url: 'https://www.reefapp.net/en/lex/details/amphiprion-ocellaris' }
    ],
    verified: true,
    minVolumeLiters: 75,
    aggressionLevel: 'peaceful',
    primaryColor: '#f97316', // Deep vibrant orange
    secondaryColor: '#ffffff' // 3 white vertical bars with black edges
  },
  {
    id: 'royal_gramma',
    commonName: 'Royal Gramma (Fairy Basslet)',
    scientificName: 'Gramma loreto',
    habitat: 'marine',
    adultSizeCm: 8.0,
    minTempC: 23,
    maxTempC: 27,
    socialBehavior: 'solitary',
    minGroupSize: 1,
    preferredZone: 'midwater',
    diet: 'carnivore',
    interestingFact: 'Dramatically bi-colored: royal violet-purple front half sharply divides into bright sunshine yellow rear half. Often hovers upside down beneath ledges.',
    sources: [
      { title: 'FishBase — Gramma loreto', url: 'https://www.fishbase.se/summary/Gramma-loreto.html' },
      { title: 'Reef App — Gramma loreto', url: 'https://www.reefapp.net/en/lex/details/gramma-loreto' }
    ],
    verified: true,
    minVolumeLiters: 110,
    aggressionLevel: 'peaceful',
    primaryColor: '#a855f7', // Electric magenta-purple
    secondaryColor: '#eab308' // Radiant yellow
  },
  {
    id: 'pajama_cardinalfish',
    commonName: 'Pajama Cardinalfish',
    scientificName: 'Sphaeramia nematoptera',
    habitat: 'marine',
    adultSizeCm: 8.5,
    minTempC: 24,
    maxTempC: 28,
    socialBehavior: 'peaceful_pair',
    minGroupSize: 2,
    preferredZone: 'midwater',
    diet: 'carnivore',
    interestingFact: 'Has enormous reddish eyes suited for nocturnal foraging, a yellow-green face, a dark waist band, and playful polka-dot rear markings.',
    sources: [
      { title: 'FishBase — Sphaeramia nematoptera', url: 'https://www.fishbase.se/summary/Sphaeramia-nematoptera.html' },
      { title: 'Reef App — Sphaeramia nematoptera', url: 'https://www.reefapp.net/en/lex/details/sphaeramia-nematoptera' }
    ],
    verified: true,
    minVolumeLiters: 110,
    aggressionLevel: 'peaceful',
    primaryColor: '#ca8a04', // Yellowish face
    secondaryColor: '#78350f' // Polka dots & waist band
  },
  {
    id: 'yellow_watchman_goby',
    commonName: 'Yellow Watchman Goby',
    scientificName: 'Cryptocentrus cinctus',
    habitat: 'marine',
    adultSizeCm: 7.5,
    minTempC: 23,
    maxTempC: 27,
    socialBehavior: 'bottom_dweller',
    minGroupSize: 1,
    preferredZone: 'bottom',
    diet: 'carnivore',
    interestingFact: 'Forms mutualistic partnerships with pistol shrimp in the wild, standing sentinel at the burrow entrance while the shrimp excavates.',
    sources: [
      { title: 'FishBase — Cryptocentrus cinctus', url: 'https://www.fishbase.se/summary/Cryptocentrus-cinctus.html' },
      { title: 'Reef App — Cryptocentrus cinctus', url: 'https://www.reefapp.net/en/lex/details/cryptocentrus-cinctus' }
    ],
    verified: true,
    minVolumeLiters: 75,
    aggressionLevel: 'peaceful',
    primaryColor: '#eab308', // Canary yellow
    secondaryColor: '#38bdf8' // Cyan-blue cheek speckles
  }
];

export function getSpeciesById(id: string): SpeciesData | undefined {
  return SPECIES_CATALOG.find(s => s.id === id);
}
