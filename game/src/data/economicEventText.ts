// ============================================
// ROME EMPIRE BUILDER - Economic Event Flavor Text
// Historically authentic economic content with strategic hints
// ============================================

import type { ResourceType } from '@/core/types';

// === ECONOMIC EVENT DEFINITIONS ===

export interface EconomicEvent {
  id: string;
  title: string;
  latinTitle: string;
  description: string;
  effect: string;
  strategicHint: string;
  icon: string;
  category: 'trade' | 'shortage' | 'surplus' | 'crisis' | 'opportunity';
  severity: 'minor' | 'moderate' | 'major' | 'catastrophic';
  duration: number; // seasons
  affectedResources: ResourceType[];
}

export const ECONOMIC_EVENTS: Record<string, EconomicEvent> = {
  // === GRAIN EVENTS ===
  grainFleetDelayed: {
    id: 'grain_fleet_delayed',
    title: 'Grain Fleet Delayed',
    latinTitle: 'Classis Frumentaria Retardata',
    description: 'Storm damage to the Egyptian grain fleet has delayed shipments to Ostia. The mob grows restless as bread prices soar. The Prefect of the Annona scrambles to find alternative sources.',
    effect: 'Grain prices +50% for 2 seasons',
    strategicHint: 'If you control Sicilia or have grain stockpiled, now is the time to sell. The desperate will pay dearly.',
    icon: 'ship',
    category: 'shortage',
    severity: 'major',
    duration: 2,
    affectedResources: ['grain'],
  },

  grainBountiful: {
    id: 'grain_bountiful',
    title: 'Abundant Harvest',
    latinTitle: 'Messis Abundans',
    description: 'The Nile floods have been exceptionally generous this year. Grain pours into Rome\'s granaries faster than it can be distributed. Farmers grumble as prices fall.',
    effect: 'Grain prices -30% for 2 seasons',
    strategicHint: 'Buy grain now while it is cheap. Store it for the inevitable lean season when prices recover.',
    icon: 'wheat',
    category: 'surplus',
    severity: 'moderate',
    duration: 2,
    affectedResources: ['grain'],
  },

  grainRiots: {
    id: 'grain_riots',
    title: 'Bread Riots',
    latinTitle: 'Tumultus Panis',
    description: 'The plebs have taken to the streets! Empty granaries and corrupt grain speculators have driven the mob to violence. Bakeries burn while the Senate debates.',
    effect: 'Stability -15, Happiness -20, but grain prices spike +80%',
    strategicHint: 'Distribute free grain (frumentatio) immediately to quell unrest. The cost in grain is less than the cost in blood.',
    icon: 'flame',
    category: 'crisis',
    severity: 'catastrophic',
    duration: 1,
    affectedResources: ['grain'],
  },

  // === IRON & MILITARY GOODS ===
  norbanGladiusDemand: {
    id: 'norban_gladius_demand',
    title: 'Legions Demand Arms',
    latinTitle: 'Legiones Arma Postulant',
    description: 'Word arrives that the legions on the frontier have lost equipment in a disastrous crossing of the Rhenus. The fabricae work day and night to meet demand.',
    effect: 'Iron prices +40% for 3 seasons',
    strategicHint: 'Control iron mines in Noricum or Hispania to profit from military contracts. War is always good for the iron trade.',
    icon: 'swords',
    category: 'opportunity',
    severity: 'moderate',
    duration: 3,
    affectedResources: ['iron'],
  },

  ironGlut: {
    id: 'iron_glut',
    title: 'Peace Dividend',
    latinTitle: 'Pax Proficit',
    description: 'The Emperor has signed a treaty with the Parthians. Weapon orders have been cancelled, and the fabricae sit idle. Iron piles up in warehouses.',
    effect: 'Iron prices -35% for 2 seasons',
    strategicHint: 'Stockpile iron now. Peace never lasts, and when the next war comes, you will profit handsomely.',
    icon: 'shield-off',
    category: 'surplus',
    severity: 'moderate',
    duration: 2,
    affectedResources: ['iron'],
  },

  // === SALT EVENTS ===
  saltMonopoly: {
    id: 'salt_monopoly',
    title: 'Salt Tax Imposed',
    latinTitle: 'Vectigal Salis',
    description: 'The Censor has imposed a new monopoly on salt sales. Private traders are forbidden from selling directly, and all salt must pass through official channels.',
    effect: 'Salt prices +60% but trade volume limited',
    strategicHint: 'Those who control the salinae at Ostia hold the key to Roman commerce. Salt preserves meat, cures hides, and pays soldiers.',
    icon: 'sparkles',
    category: 'trade',
    severity: 'major',
    duration: 4,
    affectedResources: ['salt'],
  },

  saltRoadOpen: {
    id: 'salt_road_open',
    title: 'Via Salaria Improved',
    latinTitle: 'Via Salaria Aucta',
    description: 'The censors have completed improvements to the Via Salaria. Salt now flows freely from the Adriatic marshes to Rome, bypassing the Ostian monopoly.',
    effect: 'Salt prices -25%, trade risk -10%',
    strategicHint: 'Competition among salt sources benefits buyers. Play Ostia against the Adriatic traders.',
    icon: 'route',
    category: 'opportunity',
    severity: 'minor',
    duration: 3,
    affectedResources: ['salt'],
  },

  // === LUXURY GOODS ===
  silkRoadDisruption: {
    id: 'silk_road_disruption',
    title: 'Eastern Trade Disrupted',
    latinTitle: 'Commercium Orientis Turbatum',
    description: 'Parthian raids have closed the caravan routes from Serica. Spices, silk, and exotic goods have become impossibly rare. Roman matrons weep for their cinnamon.',
    effect: 'Spices prices +100%, Wine and Olive Oil +30%',
    strategicHint: 'Luxury goods from the East command fabulous prices. Any merchant who can find alternative routes will make a fortune.',
    icon: 'flame',
    category: 'shortage',
    severity: 'major',
    duration: 3,
    affectedResources: ['spices', 'wine', 'olive_oil'],
  },

  egyptianShipsArrive: {
    id: 'egyptian_ships_arrive',
    title: 'Alexandria Fleet Arrives',
    latinTitle: 'Classis Alexandrina Advenit',
    description: 'The annual fleet from Alexandria has arrived at Puteoli! Ships laden with grain, papyrus, linen, and spices crowd the harbor. Merchants jostle for the best deals.',
    effect: 'Grain -20%, Spices -40% for 1 season',
    strategicHint: 'The arrival of the Alexandrian fleet is the greatest trade opportunity of the year. Be ready to buy.',
    icon: 'anchor',
    category: 'opportunity',
    severity: 'major',
    duration: 1,
    affectedResources: ['grain', 'spices'],
  },

  // === WINE EVENTS ===
  vineyardBlight: {
    id: 'vineyard_blight',
    title: 'Vineyard Blight',
    latinTitle: 'Lues Vinearum',
    description: 'A strange disease has struck the vineyards of Campania. Leaves wither and grapes rot on the vine. The vintage will be the worst in living memory.',
    effect: 'Wine prices +70% for 2 seasons',
    strategicHint: 'Falernian and Caecuban wines will become liquid gold. Those with cellars full of aged vintages can name their price.',
    icon: 'wine',
    category: 'shortage',
    severity: 'major',
    duration: 2,
    affectedResources: ['wine'],
  },

  bumperVintage: {
    id: 'bumper_vintage',
    title: 'Exceptional Vintage',
    latinTitle: 'Vindemia Optima',
    description: 'Jupiter has blessed the vines! Perfect weather has produced a vintage that will be remembered for generations. Even common wine tastes like nectar.',
    effect: 'Wine prices -40% for 2 seasons',
    strategicHint: 'Buy wines of this vintage and age them. In ten years, they will be worth ten times the current price.',
    icon: 'grape',
    category: 'surplus',
    severity: 'moderate',
    duration: 2,
    affectedResources: ['wine'],
  },

  // === OLIVE OIL EVENTS ===
  oliveHarvestFails: {
    id: 'olive_harvest_fails',
    title: 'Olive Blight',
    latinTitle: 'Morbus Olivarum',
    description: 'Frost has killed the olive blossoms in Baetica. The Spanish provinces, normally Rome\'s oil jar, can barely supply themselves. Lamps go dark and bodies go unanointed.',
    effect: 'Olive oil prices +80% for 3 seasons',
    strategicHint: 'Olive oil is essential for light, cooking, and hygiene. Control of African or Syrian oil becomes strategically vital.',
    icon: 'droplet',
    category: 'shortage',
    severity: 'catastrophic',
    duration: 3,
    affectedResources: ['olive_oil'],
  },

  // === TIMBER EVENTS ===
  timberShortage: {
    id: 'timber_shortage',
    title: 'Forests Depleted',
    latinTitle: 'Silvae Exhaustae',
    description: 'The shipyards of Misenum and Ravenna have consumed the last accessible timber. Building fleets and maintaining the city requires wood from ever more distant forests.',
    effect: 'Timber prices +50% for 3 seasons',
    strategicHint: 'The forests of Gaul and Germania become strategically important. Wood floated down the Rhenus commands premium prices.',
    icon: 'tree-pine',
    category: 'shortage',
    severity: 'major',
    duration: 3,
    affectedResources: ['timber'],
  },

  // === WOOL EVENTS ===
  woolDemandSpike: {
    id: 'wool_demand_spike',
    title: 'Legion Cloaks Needed',
    latinTitle: 'Sagae Legionum',
    description: 'Harsh winter on the Danube frontier has frozen soldiers in their tents. Emergency requisitions for woolen cloaks and blankets strip the markets bare.',
    effect: 'Wool prices +45% for 2 seasons',
    strategicHint: 'The Sabine hills and Tarentum produce the finest wool. Military contracts guarantee payment in good coin.',
    icon: 'shirt',
    category: 'opportunity',
    severity: 'moderate',
    duration: 2,
    affectedResources: ['wool'],
  },

  // === LIVESTOCK EVENTS ===
  cattlePlague: {
    id: 'cattle_plague',
    title: 'Cattle Plague',
    latinTitle: 'Pestis Boum',
    description: 'A terrible murrain has swept through the herds of Italia. Cattle drop dead in the fields, and even the oxen that pull the plows are dying. Agriculture itself is threatened.',
    effect: 'Livestock prices +90%, Grain production -20%',
    strategicHint: 'Import breeding stock from Gaul or Hispania immediately. Without oxen, the fields cannot be worked.',
    icon: 'beef',
    category: 'crisis',
    severity: 'catastrophic',
    duration: 2,
    affectedResources: ['livestock', 'grain'],
  },

  // === STONE & CONSTRUCTION ===
  buildingBoom: {
    id: 'building_boom',
    title: 'Imperial Building Program',
    latinTitle: 'Aedificatio Imperialis',
    description: 'The Emperor has announced a grand building program. New temples, baths, and fora will glorify Rome. Stone, clay, and timber are commandeered at premium prices.',
    effect: 'Stone +60%, Clay +40%, Timber +30% for 4 seasons',
    strategicHint: 'Construction contracts offer steady income for years. Position yourself as a reliable supplier to the imperial works.',
    icon: 'landmark',
    category: 'opportunity',
    severity: 'major',
    duration: 4,
    affectedResources: ['stone', 'clay', 'timber'],
  },

  quarryCollapse: {
    id: 'quarry_collapse',
    title: 'Quarry Disaster',
    latinTitle: 'Ruina Lapicidinae',
    description: 'A tunnel collapse at the marble quarries of Luna has killed dozens of slaves and blocked access to the finest white marble. Sculptors and builders alike despair.',
    effect: 'Stone prices +55% for 2 seasons',
    strategicHint: 'Parian or Pentelic marble from Greece becomes the alternative. Long shipping adds cost but ensures quality.',
    icon: 'mountain',
    category: 'shortage',
    severity: 'moderate',
    duration: 2,
    affectedResources: ['stone'],
  },

  // === MARKET-WIDE EVENTS ===
  currencyDebasement: {
    id: 'currency_debasement',
    title: 'Silver Shortage',
    latinTitle: 'Inopia Argenti',
    description: 'The imperial mints are diluting the silver content of the denarius. Merchants demand more coins for the same goods, and prices rise across all markets.',
    effect: 'All prices +25% for 4 seasons',
    strategicHint: 'Hold goods rather than coins during inflation. Physical commodities retain value when currency does not.',
    icon: 'coins',
    category: 'crisis',
    severity: 'major',
    duration: 4,
    affectedResources: ['grain', 'iron', 'timber', 'stone', 'clay', 'wool', 'salt', 'livestock', 'wine', 'olive_oil', 'spices'],
  },

  tradeRouteSecured: {
    id: 'trade_route_secured',
    title: 'Trade Routes Secured',
    latinTitle: 'Viae Commercii Tutae',
    description: 'The legions have cleared the roads of bandits and pirates have been swept from the seas. Trade flows freely, and prices stabilize at favorable levels.',
    effect: 'All trade risk -30%, prices stabilize',
    strategicHint: 'Safe trade routes mean higher volumes. Increase your caravan sizes to maximize profits during this golden period.',
    icon: 'shield-check',
    category: 'opportunity',
    severity: 'moderate',
    duration: 3,
    affectedResources: ['grain', 'iron', 'timber', 'stone', 'clay', 'wool', 'salt', 'livestock', 'wine', 'olive_oil', 'spices'],
  },

  pirateResurgence: {
    id: 'pirate_resurgence',
    title: 'Pirates Return',
    latinTitle: 'Piratae Resurgunt',
    description: 'Cilician pirates have returned to prey upon the sea lanes. Merchant ships refuse to sail without escort, and maritime trade grinds to a halt.',
    effect: 'Sea trade risk +50%, Spices and Wine +40%',
    strategicHint: 'Overland routes through Syria become vital. Fund anti-pirate campaigns for long-term trade security.',
    icon: 'skull',
    category: 'crisis',
    severity: 'major',
    duration: 2,
    affectedResources: ['spices', 'wine', 'olive_oil'],
  },
};

// === SEASONAL ECONOMIC FLAVOR TEXT ===

export const SEASONAL_MARKET_TEXT: Record<string, { opening: string; closing: string }> = {
  spring: {
    opening: 'As Aprilis dawns, merchants return to the roads. The spring trading season begins with renewed optimism.',
    closing: 'The spring markets close as farmers turn their attention to planting. Wise traders have stocked their warehouses.',
  },
  summer: {
    opening: 'The summer sun bakes the trade roads. Caravans travel by night to avoid the heat, but trade never stops.',
    closing: 'Summer trading ends as the Dog Star rises. The harvest season approaches, and all eyes turn to the fields.',
  },
  autumn: {
    opening: 'The vintage is in! Autumn markets overflow with new wine, fresh grain, and the bounty of the harvest.',
    closing: 'As the leaves fall, traders settle their accounts. The sailing season ends, and Mediterranean trade pauses.',
  },
  winter: {
    opening: 'Mare clausum - the sea is closed. Only the desperate or the foolish trade by sea in winter. Overland routes remain open.',
    closing: 'The Saturnalia markets bring a final flurry of trading. Soon the new year will bring new opportunities.',
  },
};

// === PRICE MOVEMENT DESCRIPTIONS ===

export const PRICE_MOVEMENT_TEXT = {
  spike: [
    'Merchants rub their hands as prices soar.',
    'Buyers curse the gods as costs spiral upward.',
    'Only the wealthy can afford such prices.',
    'The market is frenzied with desperate buyers.',
  ],
  rise: [
    'Prices climb steadily higher.',
    'Demand outpaces supply.',
    'Sellers smile at the upward trend.',
    'The market favors those who sell.',
  ],
  stable: [
    'Prices hold steady in the forum.',
    'Neither buyer nor seller complains.',
    'The market finds its equilibrium.',
    'Fair prices for fair goods.',
  ],
  fall: [
    'Prices slip downward to buyers\' delight.',
    'Surplus goods flood the market.',
    'Sellers grumble but must accept lower offers.',
    'A buyer\'s market, if there ever was one.',
  ],
  crash: [
    'Prices collapse! Merchants weep.',
    'Goods sell for a fraction of their value.',
    'The market is glutted beyond measure.',
    'Even quality goods fetch pauper\'s prices.',
  ],
};

// Helper function to get random price movement text
export function getPriceMovementText(change: number): string {
  let category: keyof typeof PRICE_MOVEMENT_TEXT;
  if (change >= 0.4) category = 'spike';
  else if (change >= 0.15) category = 'rise';
  else if (change >= -0.15) category = 'stable';
  else if (change >= -0.4) category = 'fall';
  else category = 'crash';

  const texts = PRICE_MOVEMENT_TEXT[category];
  return texts[Math.floor(Math.random() * texts.length)];
}
