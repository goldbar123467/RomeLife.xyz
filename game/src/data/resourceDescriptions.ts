// ============================================
// ROME EMPIRE BUILDER - Enhanced Resource Descriptions
// Historically authentic resource data with strategic gameplay hints
// ============================================

import type { ResourceType } from '@/core/types';

// === ENHANCED RESOURCE DEFINITION ===

export interface EnhancedResourceInfo {
  id: ResourceType;
  name: string;
  latinName: string;
  category: 'food' | 'strategic' | 'construction' | 'luxury' | 'textile';
  icon: string;
  description: string;
  historicalContext: string;
  strategicHint: string;
  productionSources: string[];
  primaryUses: string[];
  tradeNotes: string;
  seasonalFactors: {
    spring: number;
    summer: number;
    autumn: number;
    winter: number;
  };
  relatedTechnologies: string[];
  relatedBuildings: string[];
}

// === COMPREHENSIVE RESOURCE DATA ===

export const ENHANCED_RESOURCES: Record<ResourceType, EnhancedResourceInfo> = {
  grain: {
    id: 'grain',
    name: 'Grain',
    latinName: 'Frumentum',
    category: 'food',
    icon: 'wheat',
    description: 'The staff of life. Egypt provides, Rome consumes. Control grain, control the mob.',
    historicalContext: 'Rome\'s population grew beyond what Italia could feed. By the late Republic, Egypt and North Africa supplied most of Rome\'s grain. The Cura Annonae (grain supply) was a matter of state security, and the Prefect of the Annona was one of the most powerful officials in the Empire.',
    strategicHint: 'Essential for population growth. Stockpile before winter when consumption rises 15%. A grain surplus is political security.',
    productionSources: ['Farms in fertile territories', 'Sicilia and Egypt trade', 'Breadbasket-focused territories'],
    primaryUses: ['Population food consumption', 'Military supplies', 'Trade commodity', 'Feast hosting'],
    tradeNotes: 'Grain prices spike during shortages but crash after good harvests. The Alexandrian fleet arrival in autumn creates buying opportunities.',
    seasonalFactors: {
      spring: 1.1,  // Planting season, moderate prices
      summer: 0.9,  // Growing season, prices stable
      autumn: 0.75, // Harvest! Prices drop
      winter: 1.25, // Consumption up, production down
    },
    relatedTechnologies: ['crop_rotation', 'irrigation', 'grain_storage'],
    relatedBuildings: ['granary', 'farm_complex', 'mill'],
  },

  iron: {
    id: 'iron',
    name: 'Iron',
    latinName: 'Ferrum',
    category: 'strategic',
    icon: 'swords',
    description: 'The metal of Mars. From it spring swords, plows, and empire. Without iron, Rome would be nothing.',
    historicalContext: 'Rome\'s military machine consumed enormous quantities of iron. The fabricae (state weapons factories) operated around the clock during wartime. Spain (Hispania) and Noricum (Austria) provided the best ore, while skilled smiths were prized above their weight in gold.',
    strategicHint: 'Critical for military recruitment. Iron prices spike 40%+ during wartime. Stockpile during peace for massive profits when conflict erupts.',
    productionSources: ['Iron mines in Veii', 'Etruscan trade', 'Mining district territories'],
    primaryUses: ['Weapon forging (recruitment cost)', 'Building construction', 'Tool production', 'Trade commodity'],
    tradeNotes: 'Military contracts offer stable, high-value sales. The Etruscan Port pays premium prices but charges high tariffs.',
    seasonalFactors: {
      spring: 1.0,  // Campaign season begins, demand rises
      summer: 1.15, // Peak campaign season
      autumn: 0.95, // Campaigns wind down
      winter: 0.85, // Fabricae slow production
    },
    relatedTechnologies: ['iron_smelting', 'steel_working', 'damascus_steel'],
    relatedBuildings: ['iron_mine', 'forge', 'fabricae'],
  },

  timber: {
    id: 'timber',
    name: 'Timber',
    latinName: 'Materia',
    category: 'construction',
    icon: 'tree-pine',
    description: 'The bones of buildings and the ribs of ships. Rome\'s hunger for wood has stripped hills bare.',
    historicalContext: 'Roman construction and shipbuilding consumed forests at an unprecedented rate. By the Imperial period, quality timber had to be imported from Gaul, Germania, and the Black Sea region. The navy\'s demand alone could consume entire forests.',
    strategicHint: 'Essential for building construction and ship building. Prices rise during imperial building programs. Control forested territories for steady supply.',
    productionSources: ['Forested territories', 'Tiber Ford riverbanks', 'Gallic trade'],
    primaryUses: ['Building construction', 'Shipbuilding', 'Siege equipment', 'Fuel for baths and forges'],
    tradeNotes: 'Timber floated down rivers costs less than overland transport. The Gauls offer bulk rates for large orders.',
    seasonalFactors: {
      spring: 1.0,  // Building season begins
      summer: 1.1,  // Peak construction
      autumn: 1.0,  // Logging season
      winter: 0.9,  // Construction slows
    },
    relatedTechnologies: ['advanced_carpentry', 'shipbuilding', 'siege_engineering'],
    relatedBuildings: ['lumber_mill', 'shipyard', 'workshop'],
  },

  stone: {
    id: 'stone',
    name: 'Stone',
    latinName: 'Saxum',
    category: 'construction',
    icon: 'mountain',
    description: 'Rome is built of stone. From humble tufa to gleaming marble, stone proclaims eternal power.',
    historicalContext: 'Roman construction techniques transformed architecture. The use of concrete (opus caementicium) allowed unprecedented building scales. Marble from Luna (Carrara), Paros, and Numidia adorned temples and palaces, while common tufa and travertine built the city itself.',
    strategicHint: 'Required for walls, temples, and monuments. Marble commands premium prices. Stone from the Palatine is convenient but limited.',
    productionSources: ['Quarries in rocky territories', 'Palatine Hill deposits', 'Imported marble trade'],
    primaryUses: ['Wall construction', 'Temple building', 'Monument creation', 'Road paving'],
    tradeNotes: 'Heavy goods cost more to transport. Local stone is cheaper; imported marble is prestige. Imperial building programs spike demand.',
    seasonalFactors: {
      spring: 1.05, // Construction resumes
      summer: 1.1,  // Peak building season
      autumn: 1.0,  // Building continues
      winter: 0.85, // Quarries slow, construction pauses
    },
    relatedTechnologies: ['masonry', 'concrete', 'aqueduct_engineering'],
    relatedBuildings: ['quarry', 'stonemasons_guild', 'monument'],
  },

  clay: {
    id: 'clay',
    name: 'Clay',
    latinName: 'Argilla',
    category: 'construction',
    icon: 'container',
    description: 'Humble clay becomes amphorae, bricks, and roof tiles. Every building in Rome rests upon it.',
    historicalContext: 'Roman brick (later) revolutionized construction, but pottery was clay\'s primary use. Amphorae carried wine, oil, and garum across the Mediterranean. Monte Testaccio in Rome is an artificial hill made entirely of discarded amphorae.',
    strategicHint: 'Low cost, high volume commodity. Essential for basic construction. The pottery trade provides steady income without great risk.',
    productionSources: ['River deposits', 'Alba Longa pottery works', 'Ceramic workshops'],
    primaryUses: ['Brick making', 'Pottery production', 'Amphora crafting', 'Roof tiles'],
    tradeNotes: 'Clay is heavy and cheap - profits come from volume, not margins. Alba Longa has the best pottery tradition.',
    seasonalFactors: {
      spring: 1.0,  // Normal demand
      summer: 1.05, // Brick kilns active
      autumn: 1.0,  // Normal demand
      winter: 0.9,  // Kilns slow in cold
    },
    relatedTechnologies: ['pottery', 'brickmaking', 'ceramic_arts'],
    relatedBuildings: ['pottery_workshop', 'brick_kiln', 'amphora_factory'],
  },

  wool: {
    id: 'wool',
    name: 'Wool',
    latinName: 'Lana',
    category: 'textile',
    icon: 'shirt',
    description: 'Roman togas, military cloaks, and humble tunics all begin with wool. The Sabines raise the finest sheep.',
    historicalContext: 'Wool processing was traditionally women\'s work, a symbol of Roman virtue. The toga was the mark of citizenship, and its quality reflected status. Military demand for sagum (cloaks) and blankets could strip markets bare overnight.',
    strategicHint: 'Military demand spikes in winter and during frontier campaigns. Tarentine wool commands premium prices. Sabine wool is reliable quality.',
    productionSources: ['Sabine Hills pastures', 'Sabine Market trade', 'Pastoral territories'],
    primaryUses: ['Toga weaving', 'Military cloaks', 'Blankets and tunics', 'Trade goods'],
    tradeNotes: 'Winter military campaigns create urgent demand. Quality varies greatly - Tarentine wool is finest, Sabine is dependable.',
    seasonalFactors: {
      spring: 0.95, // Shearing season, supply rises
      summer: 0.9,  // Abundant supply
      autumn: 1.05, // Winter preparations
      winter: 1.25, // Peak demand for warmth
    },
    relatedTechnologies: ['advanced_weaving', 'dye_making', 'fulling'],
    relatedBuildings: ['fullery', 'textile_workshop', 'dyeworks'],
  },

  salt: {
    id: 'salt',
    name: 'Salt',
    latinName: 'Sal',
    category: 'strategic',
    icon: 'sparkles',
    description: 'White gold. Soldiers are paid in salt (salarium). Without it, meat rots and wounds fester.',
    historicalContext: 'The Via Salaria (Salt Road) was one of Rome\'s oldest roads, connecting the city to Adriatic salt pans. Salt was so valuable that soldiers received it as part of their pay - origin of the word "salary." Control of salt production was state business.',
    strategicHint: 'Essential for food preservation and military pay. Ostia controls the primary salt pans. Monopoly on salt is monopoly on power.',
    productionSources: ['Ostia salt pans', 'Adriatic salinae', 'Coastal territories'],
    primaryUses: ['Food preservation', 'Military payment (salarium)', 'Hide curing', 'Trade commodity'],
    tradeNotes: 'Salt never loses value - stockpile freely. Control of Ostia means control of salt supply. The Via Salaria offers efficient transport.',
    seasonalFactors: {
      spring: 1.0,  // Normal demand
      summer: 1.15, // Peak evaporation production
      autumn: 1.05, // Preservation season
      winter: 0.95, // Reduced production
    },
    relatedTechnologies: ['salt_extraction', 'food_preservation', 'leather_working'],
    relatedBuildings: ['salinae', 'salt_warehouse', 'curing_house'],
  },

  livestock: {
    id: 'livestock',
    name: 'Livestock',
    latinName: 'Pecus',
    category: 'food',
    icon: 'beef',
    description: 'Cattle pull plows and fill bellies. Sheep provide wool and cheese. Pigs offer the sacred meat of sacrifice.',
    historicalContext: 'Roman wealth was originally measured in cattle (pecunia comes from pecus, cattle). Sacrifices to the gods required specific animals. Working oxen were essential for agriculture, and cavalry required quality horses. The Sabines and Gauls provided the best breeding stock.',
    strategicHint: 'Cattle plagues devastate agriculture. Maintain breeding stock separate from working animals. Sacrifice animals for religious favor.',
    productionSources: ['Pastoral territories', 'Sabine Hills', 'Gallic cattle drives'],
    primaryUses: ['Meat and dairy', 'Draft animals', 'Religious sacrifices', 'Leather production'],
    tradeNotes: 'Livestock must be moved on the hoof - transport adds risk and cost. Quality breeding stock commands premium prices.',
    seasonalFactors: {
      spring: 1.0,  // Birthing season
      summer: 0.9,  // Abundant grazing
      autumn: 1.1,  // Pre-winter slaughter
      winter: 1.2,  // Fodder expensive, supply limited
    },
    relatedTechnologies: ['animal_husbandry', 'veterinary_medicine', 'selective_breeding'],
    relatedBuildings: ['stable', 'slaughterhouse', 'tannery'],
  },

  wine: {
    id: 'wine',
    name: 'Wine',
    latinName: 'Vinum',
    category: 'luxury',
    icon: 'wine',
    description: 'Blood of the grape, beloved of Bacchus. Falernian for senators, posca for soldiers. Rome runs on wine.',
    historicalContext: 'Roman wine culture was sophisticated - vintages were dated and quality graded. Falernian, Caecuban, and Setine were the great names. Common soldiers drank posca (vinegar wine), while the wealthy cellared Opimian vintage for decades. Wine was safer than water.',
    strategicHint: 'Excellent vintages appreciate over time. Wine prices spike during celebrations and after vineyard blights. Antium produces quality wines.',
    productionSources: ['Antium vineyards', 'Campanian estates', 'Greek Colony trade'],
    primaryUses: ['Daily consumption', 'Religious libations', 'Trade goods', 'Hospitality'],
    tradeNotes: 'Quality matters immensely. Vintage wines appreciate; common wine does not age well. Greek wines fetch premium prices.',
    seasonalFactors: {
      spring: 1.0,  // Normal consumption
      summer: 0.95, // Water alternatives available
      autumn: 0.8,  // New vintage arrives
      winter: 1.1,  // Indoor gatherings increase
    },
    relatedTechnologies: ['viticulture', 'amphora_making', 'wine_pressing'],
    relatedBuildings: ['vineyard', 'wine_cellar', 'tavern'],
  },

  olive_oil: {
    id: 'olive_oil',
    name: 'Olive Oil',
    latinName: 'Oleum',
    category: 'luxury',
    icon: 'droplet',
    description: 'Light, food, and cleanliness flow from the olive. The sacred tree of Minerva feeds Roman civilization.',
    historicalContext: 'Olive oil was essential to Roman life - it lit lamps, cooked food, cleaned bodies at the baths, and anointed the dead. Spain (Baetica) became the empire\'s oil jar, shipping millions of amphorae. Monte Testaccio contains countless discarded oil containers.',
    strategicHint: 'Oil never spoils and always sells. Baetica produces the best quality, but African oil is cheaper. Essential for bath operations.',
    productionSources: ['Ostia imports', 'Antium groves', 'Hispanic and African trade'],
    primaryUses: ['Lighting', 'Cooking', 'Body care at baths', 'Religious anointment'],
    tradeNotes: 'Quality grades exist - virgin oil for cooking, lamp oil for light. Baetica marks their amphorae with origin stamps.',
    seasonalFactors: {
      spring: 1.0,  // Normal demand
      summer: 0.9,  // Longer days reduce lamp use
      autumn: 0.85, // Harvest season
      winter: 1.15, // Long nights increase lamp use
    },
    relatedTechnologies: ['olive_pressing', 'lamp_making', 'soap_making'],
    relatedBuildings: ['olive_press', 'bath_house', 'lamp_shop'],
  },

  spices: {
    id: 'spices',
    name: 'Spices',
    latinName: 'Aromata',
    category: 'luxury',
    icon: 'flame',
    description: 'Pepper, cinnamon, and exotic aromata from beyond the known world. Worth more than gold by weight.',
    historicalContext: 'Spices traveled thousands of miles from India, Ceylon, and Arabia to reach Roman tables. The spice trade drained gold from the empire, but demand never ceased. Pliny complained that Rome spent 100 million sesterces yearly on eastern luxuries.',
    strategicHint: 'Highest profit margins of any commodity. Supply disruptions create extreme price spikes. The Eastern trade route is essential.',
    productionSources: ['Greek Colony trade', 'Eastern merchant caravans', 'Alexandria imports'],
    primaryUses: ['Cuisine flavoring', 'Medicine', 'Perfumes', 'Funeral rites'],
    tradeNotes: 'Spices are light and valuable - perfect for long-distance trade. Prices can quadruple during supply disruptions. Authentication is critical.',
    seasonalFactors: {
      spring: 1.0,  // Normal demand
      summer: 0.95, // Monsoon affects eastern shipping
      autumn: 0.9,  // Alexandrian fleet arrives
      winter: 1.1,  // Festive season, mare clausum
    },
    relatedTechnologies: ['trade_routes', 'navigation', 'preservation'],
    relatedBuildings: ['spice_warehouse', 'apothecary', 'emporium'],
  },
};

// === REGIONAL ECONOMIC LORE ===

export interface RegionalEconomicLore {
  id: string;
  name: string;
  latinName: string;
  economicProfile: string;
  specialties: ResourceType[];
  whySpecial: string;
  tradeAdvantages: string[];
  tradeDisadvantages: string[];
  historicalNote: string;
}

export const REGIONAL_LORE: Record<string, RegionalEconomicLore> = {
  ostia: {
    id: 'ostia',
    name: 'Ostia',
    latinName: 'Ostia Tiberina',
    economicProfile: 'Rome\'s gateway to the sea. All Mediterranean trade flows through the docks of Ostia.',
    specialties: ['salt', 'olive_oil'],
    whySpecial: 'The salinae (salt pans) at the Tiber\'s mouth have produced salt since Rome\'s founding. The port handles massive grain shipments from Egypt and Africa. Fish from the fishing fleet arrives fresh daily.',
    tradeAdvantages: [
      'Lowest fish and salt prices in the region',
      'First access to imported goods',
      'Efficient transport up the Tiber to Rome',
      'Established warehousing infrastructure',
    ],
    tradeDisadvantages: [
      'Harbor silting requires constant dredging',
      'Malarial marshes limit permanent settlement',
      'Pirate threats during turbulent times',
      'Winter storms close the port for months',
    ],
    historicalNote: 'Founded traditionally by Ancus Marcius, Rome\'s fourth king, Ostia grew from a military outpost to the empire\'s busiest port. At its peak, over 50,000 people lived here, processing grain that fed a million Romans.',
  },

  etruria: {
    id: 'etruria',
    name: 'Etruria',
    latinName: 'Etruria',
    economicProfile: 'The ancient heart of Italian metallurgy. Etruscan smiths have worked bronze and iron for centuries.',
    specialties: ['iron'],
    whySpecial: 'The Etruscans mastered metalworking before Rome existed. Their bronze is world-famous, and iron deposits near Veii supplied Roman armies. Skilled artisans command premium prices because their work is simply superior.',
    tradeAdvantages: [
      'Highest quality metalwork available',
      'Centuries of accumulated expertise',
      'Established trade connections to Greece',
      'Superior finishing and craftsmanship',
    ],
    tradeDisadvantages: [
      'High prices reflect artisan skills',
      'Limited ore deposits compared to Hispania',
      'Cultural pride limits negotiation',
      'Competition from Roman fabricae',
    ],
    historicalNote: 'Before Rome rose to power, the Etruscans dominated central Italy. Their technical knowledge - especially in metallurgy, engineering, and divination - was absorbed by Rome. Etruscan bronzes are found in temples from Rome to the Bosphorus.',
  },

  sicilia: {
    id: 'sicilia',
    name: 'Sicilia',
    latinName: 'Sicilia',
    economicProfile: 'The breadbasket of Rome. Sicilian grain feeds the empire.',
    specialties: ['grain'],
    whySpecial: 'Sicily\'s fertile volcanic soil and reliable rainfall produce abundant harvests year after year. Greek agricultural techniques perfected over centuries make this the most productive grain region in the western Mediterranean.',
    tradeAdvantages: [
      'Massive grain surpluses',
      'Short sailing distance to Rome',
      'Established slave-worked latifundia',
      'Multiple harvests per year possible',
    ],
    tradeDisadvantages: [
      'Servile war risk (slave revolts)',
      'Competition with Egyptian grain',
      'Pirate activity in the straits',
      'Political instability in the province',
    ],
    historicalNote: 'Rome\'s first overseas province, acquired after the First Punic War. The great slave estates (latifundia) produced grain on an industrial scale. The Servile Wars demonstrated the dangers of concentrating too many slaves in one region.',
  },

  gallia: {
    id: 'gallia',
    name: 'Gallia',
    latinName: 'Gallia',
    economicProfile: 'Forests, cattle, and fierce warriors. Gaul supplies Rome\'s armies and its appetite.',
    specialties: ['timber', 'livestock', 'wool'],
    whySpecial: 'The vast forests of Gaul seem inexhaustible compared to depleted Italian woods. Gallic cattle are larger and stronger than Italian breeds. Wool from northern sheep is coarser but durable.',
    tradeAdvantages: [
      'Bulk commodities at competitive prices',
      'Reliable supply from multiple tribes',
      'River transport along the Rhone and Rhine',
      'Expanding Roman settlement increases production',
    ],
    tradeDisadvantages: [
      'Long distances increase transport costs',
      'Border instability from Germanic raids',
      'Cultural differences complicate negotiations',
      'Quality varies by tribal source',
    ],
    historicalNote: 'Julius Caesar\'s conquest opened Gaul to Roman commerce. Within a generation, Gallic merchants were trading in the Forum, and Gallic goods flowed to every corner of the empire.',
  },

  aegyptus: {
    id: 'aegyptus',
    name: 'Aegyptus',
    latinName: 'Aegyptus',
    economicProfile: 'The Nile\'s gift: grain, papyrus, and ancient wealth beyond measure.',
    specialties: ['grain', 'spices'],
    whySpecial: 'The Nile floods deposit fresh fertile soil every year, allowing harvests that dwarf anything possible elsewhere. Egypt also sits astride the trade route from India, giving access to Eastern luxuries.',
    tradeAdvantages: [
      'Largest grain surplus in the Mediterranean',
      'Gateway to Eastern spice trade',
      'Papyrus monopoly',
      'Ancient infrastructure and expertise',
    ],
    tradeDisadvantages: [
      'Nile flood failures cause famine',
      'Dangerous sea voyage to Rome',
      'Imperial monopoly limits private trade',
      'Political sensitivity - Emperor\'s personal property',
    ],
    historicalNote: 'Egypt was so important that Augustus made it his personal property, forbidden even to senators. The Prefect of Egypt controlled grain that could starve Rome. The phrase "whoever controls Egypt, controls Rome" was political reality.',
  },

  hispania: {
    id: 'hispania',
    name: 'Hispania',
    latinName: 'Hispania',
    economicProfile: 'Silver, gold, and the finest olive oil in the empire.',
    specialties: ['iron', 'olive_oil', 'wine'],
    whySpecial: 'Spanish silver mines funded Roman conquests for centuries. Baetica produces olive oil so fine that Spanish amphorae are found from Britain to India. The wines of Tarraconensis rival Italian vintages.',
    tradeAdvantages: [
      'Rich mineral deposits',
      'Premium olive oil production',
      'Established export infrastructure',
      'Romanized population ensures stability',
    ],
    tradeDisadvantages: [
      'Long voyage to Rome',
      'Competition from African oil',
      'Mining depletes easily accessible deposits',
      'Northern tribes remain restive',
    ],
    historicalNote: 'Spain was Rome\'s first major conquest outside Italy, source of the wealth that funded expansion. The silver of Cartagena, the oil of Baetica, and the garum of Cadiz enriched generations of Roman merchants.',
  },
};

// === TRADE ROUTE DESCRIPTIONS ===

export interface TradeRouteDescription {
  id: string;
  name: string;
  latinName: string;
  description: string;
  primaryGoods: ResourceType[];
  distance: 'short' | 'medium' | 'long' | 'extreme';
  risk: 'safe' | 'moderate' | 'dangerous' | 'perilous';
  seasonalNotes: string;
  strategicTip: string;
}

export const TRADE_ROUTES: Record<string, TradeRouteDescription> = {
  via_salaria: {
    id: 'via_salaria',
    name: 'Via Salaria',
    latinName: 'Via Salaria',
    description: 'The ancient Salt Road, connecting Rome to the Adriatic salt pans. One of the oldest roads in Italy.',
    primaryGoods: ['salt', 'wool', 'livestock'],
    distance: 'medium',
    risk: 'safe',
    seasonalNotes: 'Open year-round. Sabine markets are busiest in autumn during the wool trading season.',
    strategicTip: 'Combine salt purchases with Sabine wool for efficient caravan use. Both goods are durable and profit from volume.',
  },

  tiber_route: {
    id: 'tiber_route',
    name: 'Tiber River Route',
    latinName: 'Navigatio Tiberina',
    description: 'Barges carry goods between Ostia and Rome, the cheapest transport available for bulk goods.',
    primaryGoods: ['grain', 'timber', 'stone'],
    distance: 'short',
    risk: 'safe',
    seasonalNotes: 'The Tiber floods in spring, occasionally disrupting traffic. Summer droughts may lower water levels.',
    strategicTip: 'Bulk goods like grain and stone should always travel by river when possible. The cost savings are substantial.',
  },

  egyptian_route: {
    id: 'egyptian_route',
    name: 'Alexandrian Route',
    latinName: 'Navigatio Alexandrina',
    description: 'The great grain route from Alexandria to Puteoli and Ostia. The lifeline of Rome.',
    primaryGoods: ['grain', 'spices'],
    distance: 'long',
    risk: 'moderate',
    seasonalNotes: 'Mare clausum - the sea is closed from November to March. The annual fleet arrives in late summer.',
    strategicTip: 'Time purchases to the arrival of the Alexandrian fleet in autumn when prices are lowest. Store for winter profits.',
  },

  silk_road: {
    id: 'silk_road',
    name: 'Eastern Spice Route',
    latinName: 'Via Serica',
    description: 'The legendary route bringing silk and spices from India and beyond. Profits are enormous, but so are risks.',
    primaryGoods: ['spices'],
    distance: 'extreme',
    risk: 'perilous',
    seasonalNotes: 'Monsoon winds dictate sailing schedules. Caravans through Parthia face bandit and political risks.',
    strategicTip: 'Spice trade requires patience and capital. A single successful voyage can fund a year\'s operations.',
  },

  gallic_route: {
    id: 'gallic_route',
    name: 'Gallic Trade Road',
    latinName: 'Via Gallica',
    description: 'Overland routes through the Alps and along the Rhone, bringing Gallic goods to Italian markets.',
    primaryGoods: ['timber', 'livestock', 'wool'],
    distance: 'long',
    risk: 'moderate',
    seasonalNotes: 'Alpine passes close in winter. Cattle drives are best in autumn before snows begin.',
    strategicTip: 'Bulk goods from Gaul profit from return trips. Bring wine and oil north; return with timber and cattle.',
  },

  hispanic_route: {
    id: 'hispanic_route',
    name: 'Hispania Maritime Route',
    latinName: 'Navigatio Hispanica',
    description: 'The sea route around Sardinia and Corsica to the riches of Spain.',
    primaryGoods: ['iron', 'olive_oil', 'wine'],
    distance: 'long',
    risk: 'moderate',
    seasonalNotes: 'Pirate activity increases in summer. Winter storms make the passage dangerous.',
    strategicTip: 'Spanish oil competes with African. Time purchases to undercut Italian markets when supply is low.',
  },
};

// === HELPER FUNCTIONS ===

export function getResourceStrategicHint(resource: ResourceType): string {
  return ENHANCED_RESOURCES[resource]?.strategicHint ||
    'This commodity has trading potential.';
}

export function getSeasonalPriceModifier(resource: ResourceType, season: string): number {
  const resourceInfo = ENHANCED_RESOURCES[resource];
  if (!resourceInfo) return 1.0;

  const seasonKey = season.toLowerCase() as keyof typeof resourceInfo.seasonalFactors;
  return resourceInfo.seasonalFactors[seasonKey] || 1.0;
}

export function getResourceCategory(resource: ResourceType): string {
  return ENHANCED_RESOURCES[resource]?.category || 'basic';
}
