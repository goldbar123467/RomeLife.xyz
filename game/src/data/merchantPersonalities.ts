// ============================================
// ROME EMPIRE BUILDER - Merchant Personalities
// Diverse merchant archetypes with unique dialogue and trading behaviors
// ============================================

import type { ResourceType } from '@/core/types';

// === MERCHANT ARCHETYPE DEFINITIONS ===

export interface MerchantPersonality {
  id: string;
  name: string;
  latinName: string;
  title: string;
  origin: string;
  portrait: string; // Icon reference
  archetype: 'honest' | 'shrewd' | 'specialist' | 'exotic' | 'bulk' | 'shady';
  description: string;
  specialty: ResourceType[];
  priceModifier: number; // 1.0 = base price, 0.9 = 10% discount, 1.1 = 10% markup
  haggleChance: number; // 0-1, chance of accepting a counter-offer
  loyaltyBonus: number; // % discount for repeat customers
  dialogue: MerchantDialogue;
  history: string;
}

export interface MerchantDialogue {
  greeting: string[];
  haggleAccept: string[];
  haggleReject: string[];
  purchaseComplete: string[];
  saleComplete: string[];
  lowInventory: string[];
  specialOffer: string[];
  farewell: string[];
  insulted: string[]; // When offer is too low
  impressed: string[]; // When player makes a great deal
}

// === MERCHANT PERSONALITIES ===

export const MERCHANTS: Record<string, MerchantPersonality> = {
  marcusTheFair: {
    id: 'marcus_the_fair',
    name: 'Marcus Aurelius Mercator',
    latinName: 'Marcus Aurelius Mercator',
    title: 'The Fair',
    origin: 'Rome',
    portrait: 'user-check',
    archetype: 'honest',
    description: 'A third-generation Roman merchant known throughout the Forum for his honest scales and fair prices. Marcus believes that reputation is worth more than gold.',
    specialty: ['grain', 'timber', 'stone'],
    priceModifier: 1.0,
    haggleChance: 0.1, // Rarely haggles - prices are already fair
    loyaltyBonus: 0.05, // 5% discount for regulars
    dialogue: {
      greeting: [
        'Salve, friend! My prices are the same for senator and slave alike.',
        'Welcome to my stall. What you see is what you pay - no tricks here.',
        'Ah, a customer with discerning taste. My goods speak for themselves.',
        'The gods favor honest dealing. How may I serve you today?',
      ],
      haggleAccept: [
        'You make a fair point. The price is adjusted.',
        'For a valued customer, I can bend slightly.',
        'My reputation allows no great discounts, but this I can do.',
      ],
      haggleReject: [
        'My prices are already fair. I cannot go lower and remain honest.',
        'I quote the same price to all. That IS the discount.',
        'Haggle with the Syrians if you wish. My word is my bond.',
        'The price reflects the quality. I will not cheapen either.',
      ],
      purchaseComplete: [
        'A fair trade! May the gods bless your business.',
        'You will not regret buying from Marcus the Fair.',
        'Quality goods at honest prices. That is my promise.',
      ],
      saleComplete: [
        'Good quality, fairly priced. The transaction is complete.',
        'May your goods bring you prosperity.',
        'I pay what goods are worth - no more, no less.',
      ],
      lowInventory: [
        'Supply is limited. Even I cannot conjure goods from air.',
        'The warehouses run low. What I have, I offer at unchanged prices.',
        'Scarcity afflicts even honest merchants.',
      ],
      specialOffer: [
        'For a regular customer, I have set aside prime goods.',
        'My best stock, offered first to those I trust.',
        'Quality rewards loyalty. Examine these.',
      ],
      farewell: [
        'Vale! May Mercury guide your dealings.',
        'Until next time. My door is always open to honest traders.',
        'Fair winds and fair trades to you.',
      ],
      insulted: [
        'I am Marcus the Fair, not Marcus the Foolish.',
        'That offer insults us both. Let us speak seriously.',
        'I have dealt fairly with you. I expect the same courtesy.',
      ],
      impressed: [
        'You know your business. A pleasure to deal with a professional.',
        'The Forum could use more traders of your caliber.',
        'An excellent negotiation. I look forward to our next meeting.',
      ],
    },
    history: 'The Mercator family has traded in the Forum Boarium for three generations. Marcus\'s grandfather established the family reputation for fair dealing, and Marcus guards it zealously. He is often called upon to arbitrate disputes between merchants.',
  },

  gaiusSerpentius: {
    id: 'gaius_serpentius',
    name: 'Gaius Serpentius',
    latinName: 'Gaius Serpentius Noctua',
    title: 'The Shadow',
    origin: 'Ostia',
    portrait: 'eye',
    archetype: 'shady',
    description: 'A trader in rare and questionable goods. Gaius deals in items that fall off ships, goods of uncertain provenance, and merchandise that official channels cannot provide.',
    specialty: ['spices', 'wine', 'iron'],
    priceModifier: 0.75, // Cheap... but why?
    haggleChance: 0.8, // Always haggles
    loyaltyBonus: 0.15, // Big discounts for trusted associates
    dialogue: {
      greeting: [
        '*looks around* Ah, a customer. Step closer, friend. Not everyone can see my wares.',
        'You look like someone who appreciates... discretion. Am I right?',
        'The best goods never make it to the public market. You understand.',
        'Shh! Official prices are for official goods. I deal in neither.',
      ],
      haggleAccept: [
        '*sighs* You drive a hard bargain. Very well.',
        'For you? Fine. But tell no one this price.',
        'You twist my arm. The deal is done.',
        'Agreed, agreed. Now let us conclude this quietly.',
      ],
      haggleReject: [
        'Even I have my limits, friend.',
        'I am giving you a gift already. Do not be greedy.',
        'At this price, I am practically paying YOU.',
        '*laughs* You want me to PAY you to take my goods?',
      ],
      purchaseComplete: [
        'A pleasure. You never saw me. I was never here.',
        'The goods are yours. Their origin is... complicated.',
        'Ask no questions about where these came from.',
      ],
      saleComplete: [
        'Good, good. The coin disappears as quickly as the goods.',
        'A fair price for goods that officially do not exist.',
        'The transaction is complete. There is no record of it.',
      ],
      lowInventory: [
        'My suppliers are... temporarily indisposed. The prisons are full.',
        'A shipment was seized. I will have more soon.',
        'The aediles have been active. Stock is thin.',
      ],
      specialOffer: [
        '*whispers* I have something special. Imperial goods that... wandered off.',
        'Close your eyes and tell me what you need. I can find anything.',
        'For a trusted associate, I have items that would interest collectors.',
      ],
      farewell: [
        'Remember - we never met. You were never here.',
        'Until next time. The shadows always need trading.',
        'Vale, friend. May you stay one step ahead of the law.',
      ],
      insulted: [
        'Do you think I am a fool? I risk my neck for these goods.',
        'Insult me again and you can deal with the official markets.',
        'That price barely covers my bribes. Be serious.',
      ],
      impressed: [
        'You have the makings of a true trader. Perhaps a partnership...',
        'Ha! You bargain like a Syrian. I approve.',
        'You understand how the real economy works. Excellent.',
      ],
    },
    history: 'No one knows Gaius\'s true background. Some say he was a slave who earned his freedom; others claim he was a patrician who fell from grace. What everyone knows is that Gaius can acquire anything - for a price.',
  },

  liviaOfOstia: {
    id: 'livia_of_ostia',
    name: 'Livia Piscatrix',
    latinName: 'Livia Piscatrix Ostiensis',
    title: 'The Fish Queen',
    origin: 'Ostia',
    portrait: 'fish',
    archetype: 'specialist',
    description: 'Widow of a fishing fleet owner, Livia now runs the largest fish and salt operation in Ostia. Her garum sauce is legendary, and her prices for regulars are unbeatable.',
    specialty: ['salt', 'olive_oil'],
    priceModifier: 0.85, // Good prices for specialties
    haggleChance: 0.4,
    loyaltyBonus: 0.10, // Rewards loyal customers well
    dialogue: {
      greeting: [
        'Fresh from the nets this morning! What will it be?',
        'Salve! The catch today is exceptional. Mercury blessed our boats.',
        'Welcome, welcome! My salt is the purest, my garum the finest.',
        'Ah, a familiar face! The usual, or something special today?',
      ],
      haggleAccept: [
        'For a regular customer, I can do this.',
        'My husband would have said yes, so I do too.',
        'You know my business well. Fair enough.',
      ],
      haggleReject: [
        'These are the prices of Ostia, friend. Fair as the sea is wide.',
        'I have children to feed. The price stands.',
        'Try the Forum if you want to be cheated. Here, prices are honest.',
        'The fishermen must eat too. I cannot go lower.',
      ],
      purchaseComplete: [
        'The finest goods from the mother sea. Enjoy!',
        'May this salt preserve your food and your fortune.',
        'A good purchase. The sea provides.',
      ],
      saleComplete: [
        'I pay fairly for quality. My reputation depends on it.',
        'Good goods. The ships will be pleased.',
        'This will serve my customers well.',
      ],
      lowInventory: [
        'The seas have been rough. Even Neptune cannot guarantee catches.',
        'Storms kept the fleet in harbor. Pray for calm waters.',
        'Supply runs low, but quality remains high.',
      ],
      specialOffer: [
        'For you, I saved the best of today\'s catch.',
        'My finest garum, aged three years. Taste before you buy.',
        'This salt is from the ancient pans. Nothing purer in all Italia.',
      ],
      farewell: [
        'May Neptune fill your nets with fortune.',
        'Come back soon! The best goes first.',
        'Vale! The docks are always open to friends.',
      ],
      insulted: [
        'I am a widow, not a charity. Show some respect.',
        'My husband died bringing these goods to market. Honor his memory.',
        'The sea takes much from us. Do not add insult.',
      ],
      impressed: [
        'You know quality when you see it. I respect that.',
        'A trader after my own heart. My husband would have liked you.',
        'Come back tomorrow. I will save you the best.',
      ],
    },
    history: 'Livia\'s husband drowned in a storm fifteen years ago. Rather than sell the business, she took it over, defying those who said a woman could not run a trading concern. Today, her operation is the largest in Ostia.',
  },

  rashidOfAlexandria: {
    id: 'rashid_of_alexandria',
    name: 'Rashid al-Misr',
    latinName: 'Rashidus Alexandrinus',
    title: 'The Eastern Wind',
    origin: 'Alexandria',
    portrait: 'star',
    archetype: 'exotic',
    description: 'A trader from the great library city, Rashid deals in the treasures of the East - spices, silks, papyrus, and stranger things still. His prices are high, but his goods are genuine.',
    specialty: ['spices', 'wine'],
    priceModifier: 1.15, // Premium for exotic goods
    haggleChance: 0.9, // Haggling is expected and enjoyed
    loyaltyBonus: 0.08,
    dialogue: {
      greeting: [
        'As-salamu alaykum, noble Roman! The treasures of the East await.',
        'Ah! A connoisseur! Come, let me show you wonders.',
        'From the Nile to the Tiber, I bring the finest goods.',
        'Welcome, friend! In Alexandria, we say every customer is a gift from the gods.',
      ],
      haggleAccept: [
        'You bargain like a merchant of Petra! Very well.',
        'My grandfather would approve of you. Done!',
        'In the East, we call this "finding the middle path." Agreed.',
        'You have honored me with your skill. The price is yours.',
      ],
      haggleReject: [
        'My friend, these goods traveled three thousand miles. The price is fair.',
        'In Damascus, they would pay double. I am being generous.',
        'The camel does not argue when the master says "kneel."',
        'The sun does not negotiate with the sand. Some things are fixed.',
      ],
      purchaseComplete: [
        'May these goods bring you joy and prosperity!',
        'The quality of the East, now in Roman hands.',
        'You will not regret this purchase. The ancestors smile upon it.',
      ],
      saleComplete: [
        'Fair price for fair goods. The East and West meet in harmony.',
        'May your camels never tire and your ships never sink.',
        'Allah... ah, that is, the gods bless our transaction.',
      ],
      lowInventory: [
        'The caravans are delayed. Bandits, you understand.',
        'The monsoon winds have not favored the ships. Be patient.',
        'What I have is rare. Rarity demands patience.',
      ],
      specialOffer: [
        'For a friend of the East, I reveal my hidden treasures.',
        'This... this I brought only for those who truly understand.',
        'Cinnamon from Ceylon. Pepper from Malabar. Silk from Serica. Choose your wonder.',
      ],
      farewell: [
        'Ma\'a salama! Until the winds bring me back to Rome.',
        'May your path be smooth and your profits great.',
        'The East remembers its friends. Until we meet again!',
      ],
      insulted: [
        'I crossed deserts for these goods! Show respect.',
        'In my country, such an offer would be answered with a blade.',
        'You mistake me for a common market hawker. I am not.',
      ],
      impressed: [
        'Ah! You have the soul of a Phoenician trader! Magnificent!',
        'Come to Alexandria someday. I will show you true treasures.',
        'You bargain with wisdom. The East welcomes such minds.',
      ],
    },
    history: 'Born in the shadow of the great Library of Alexandria, Rashid learned the trade routes as a boy, traveling with his father\'s caravans. He speaks six languages and has traded with princes from Britain to India.',
  },

  gnaeusTheBull: {
    id: 'gnaeus_the_bull',
    name: 'Gnaeus Brutus Magnus',
    latinName: 'Gnaeus Brutus Magnus',
    title: 'The Bull',
    origin: 'Cisalpine Gaul',
    portrait: 'beef',
    archetype: 'bulk',
    description: 'A massive Gaul who deals in bulk commodities - cattle, grain, and timber by the shipload. Gnaeus doesn\'t waste time with small purchases, but for large orders, his prices are unbeatable.',
    specialty: ['livestock', 'timber', 'grain'],
    priceModifier: 0.9, // Bulk discount
    haggleChance: 0.3,
    loyaltyBonus: 0.12,
    dialogue: {
      greeting: [
        '*grunts* You buying or selling? I do not waste time with lookers.',
        'Speak quick. I have three ships to unload today.',
        'Small orders go to the Forum. You want REAL goods? Talk to me.',
        'Aye, I have what you need. In quantity. Let us deal.',
      ],
      haggleAccept: [
        '*spits in hand* Done. My word is iron.',
        'For that volume? Fine. But delivery is extra.',
        'You drive hard, Roman. Very well.',
      ],
      haggleReject: [
        'I am already cutting my own throat. The price stands.',
        'Go find another supplier for ten thousand bushels. I will wait.',
        'Do not waste my time with small thinking.',
        'The price is the price. Take it or find someone who can match my volume.',
      ],
      purchaseComplete: [
        'Delivery in three days. The Bull keeps his word.',
        'Good trade. Now excuse me, I have more business.',
        'Done. Next?',
      ],
      saleComplete: [
        'Quality goods. My buyers will be pleased.',
        'Fair price. Now get out of my way.',
        'Good. The warehouses needed filling.',
      ],
      lowInventory: [
        'Even I cannot conjure a thousand cattle from thin air.',
        'The herds are depleted. Wait for the next drove from Gaul.',
        'Supply is tight. Prices rise accordingly.',
      ],
      specialOffer: [
        'I have a ship coming in. Buy the whole cargo, I give you my best price.',
        'A legion contract fell through. Their loss is your gain.',
        'Take the entire herd and I cut fifteen percent.',
      ],
      farewell: [
        '*nods* Until next time.',
        'May your warehouses overflow.',
        'The Bull remembers those who deal straight.',
      ],
      insulted: [
        '*cracks knuckles* Think carefully about your next words.',
        'I wrestled bears in Gaul. You think I fear your haggling?',
        'Insult me again and find your own supply chain.',
      ],
      impressed: [
        'Ha! You have stones, Roman. I like that.',
        'Good negotiator. We will do more business.',
        'You understand volume. We speak the same language.',
      ],
    },
    history: 'Gnaeus was a chieftain\'s son in Cisalpine Gaul before the Roman conquest. When Rome came, he saw opportunity rather than resistance. Now he supplies half of Rome\'s bulk goods through a network stretching from Hispania to Dacia.',
  },

  corneliaTheScholar: {
    id: 'cornelia_the_scholar',
    name: 'Cornelia Sapiens',
    latinName: 'Cornelia Sapiens',
    title: 'The Scholar',
    origin: 'Rome',
    portrait: 'book-open',
    archetype: 'shrewd',
    description: 'A patrician widow who trades in commodities using mathematical models and market analysis. Cornelia knows more about price movements than anyone in Rome.',
    specialty: ['iron', 'wool', 'clay'],
    priceModifier: 1.05, // Slightly above market, but always fair value
    haggleChance: 0.5,
    loyaltyBonus: 0.06,
    dialogue: {
      greeting: [
        'Ah, you arrive at an opportune moment. The markets favor buyers today.',
        'I have analyzed the trends. Shall I share my insights?',
        'Knowledge is the true commodity. The goods are merely... manifestations.',
        'Welcome. I presume you seek more than simple trade?',
      ],
      haggleAccept: [
        'Your logic is sound. I adjust my position accordingly.',
        'A well-reasoned argument deserves accommodation.',
        'The numbers support your proposal. Agreed.',
      ],
      haggleReject: [
        'I have calculated the true value. Sentiment cannot change mathematics.',
        'Your offer falls outside acceptable parameters. Revise it.',
        'The market does not lie. Neither do my calculations.',
        'Emotion has no place in commerce. The price is the price.',
      ],
      purchaseComplete: [
        'An optimal transaction. The timing was calculated precisely.',
        'You have bought at the local minimum. Well done.',
        'The exchange rate favors this purchase. Wise choice.',
      ],
      saleComplete: [
        'Fair value exchanged for fair value. The equation balances.',
        'An efficient transaction. Thank you.',
        'The market has spoken, and we have listened.',
      ],
      lowInventory: [
        'Supply constraints are temporary. The cycle will turn.',
        'Scarcity creates opportunity. Patience rewards the prepared.',
        'Current inventory reflects market conditions, not my capabilities.',
      ],
      specialOffer: [
        'I have detected an arbitrage opportunity. You should act.',
        'Market inefficiency creates profit for the informed. Listen carefully.',
        'My analysis suggests this commodity will appreciate. Consider investing.',
      ],
      farewell: [
        'May your transactions be ever in your favor.',
        'The market closes, but knowledge compounds. Farewell.',
        'Until next time. I shall continue observing the patterns.',
      ],
      insulted: [
        'I am a patrician of the Cornelii. Your manners need adjustment.',
        'Ignorance of value does not excuse rudeness.',
        'Perhaps you should trade with those who match your... sophistication.',
      ],
      impressed: [
        'You understand the deeper currents of commerce. Rare indeed.',
        'A mind for markets. I should like to discuss theory with you.',
        'You grasp what most traders miss. There may be opportunity for collaboration.',
      ],
    },
    history: 'Cornelia was educated in philosophy and mathematics, unusual for a Roman woman. When her husband died, she applied her knowledge to commodity trading, building a fortune that rivals any patrician family. Her market predictions are uncannily accurate.',
  },
};

// === MERCHANT ENCOUNTER FUNCTIONS ===

export function getRandomMerchantForResource(resource: ResourceType): MerchantPersonality {
  // Find merchants who specialize in this resource
  const specialists = Object.values(MERCHANTS).filter(m =>
    m.specialty.includes(resource)
  );

  // If specialists exist, 70% chance to get one
  if (specialists.length > 0 && Math.random() < 0.7) {
    return specialists[Math.floor(Math.random() * specialists.length)];
  }

  // Otherwise, random merchant
  const allMerchants = Object.values(MERCHANTS);
  return allMerchants[Math.floor(Math.random() * allMerchants.length)];
}

export function getMerchantDialogue(
  merchant: MerchantPersonality,
  category: keyof MerchantDialogue
): string {
  const options = merchant.dialogue[category];
  return options[Math.floor(Math.random() * options.length)];
}

export function calculateMerchantPrice(
  basePrice: number,
  merchant: MerchantPersonality,
  customerLoyalty: number // 0-100, representing relationship
): number {
  let price = basePrice * merchant.priceModifier;

  // Apply loyalty discount
  const loyaltyDiscount = (customerLoyalty / 100) * merchant.loyaltyBonus;
  price *= (1 - loyaltyDiscount);

  return Math.round(price);
}
