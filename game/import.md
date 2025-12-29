# Rome Empire Builder - Feature Import Tracker

This document tracks features from `Rome.life_Draft.html` that need to be ported to the Next.js implementation.

**Legend**:
- [ ] Not started
- [~] Partially implemented
- [x] Complete

---

## Religion System

### Patron Gods & Favor [~]
- [x] 6 Roman gods defined (Jupiter, Mars, Venus, Ceres, Mercury, Minerva)
- [x] Patron god selection
- [x] Favor tracking per god (0-100)
- [x] Blessings displayed at tier thresholds (25/50/75/100)
- [ ] **Blessings actually apply effects when unlocked**
- [ ] God-specific bonuses during battles
- [ ] Victory rewards with patron god (+3-5 favor, +5 piety)

### Religious Buildings [ ]
| Building | Cost | Piety/Season | Favor/Season | Status |
|----------|------|--------------|--------------|--------|
| Shrine | 200 | +3 | +2 | [ ] |
| Temple | 600 | +8 | +5 | [ ] |
| Oracle | 450 | +5 | +8 | [ ] |
| Altar | 350 | +6 | +4 | [ ] |
| Augury House | 500 | +7 | +6 | [ ] |

### Worship Actions [~]
| Action | Cost | Effect | Status |
|--------|------|--------|--------|
| Prayer | Free | +5 favor | [x] |
| Sacrifice | 5 livestock | +15 favor | [x] |
| Festival | 500 denarii | +25 favor, +15 happiness | [x] |
| Divination | 150d + 20 piety | Reveal future events, +5 favor | [ ] |
| Pilgrimage | 300d | +30 favor, +15 piety, +8 reputation | [ ] |
| Consecrate | 400d + 30 piety | +25% territory production | [ ] |
| Invoke Blessing | 50 piety | God-specific powerful effect | [ ] |

### Religious Events [ ]
| Event | Effect | Status |
|-------|--------|--------|
| Divine Omen | +10 piety, +5% happiness, +5 god favor | [ ] |
| Solar Eclipse | +15 piety, -10% morale, reveal events | [ ] |
| Comet Sighting | +20 god favor, +10 reputation | [ ] |
| Miracle | +25 piety, +200 food, +20% happiness | [ ] |
| Divine Wrath | -20 piety, -50 food, -15% morale | [ ] |
| Prophetic Dream | +12 piety, +8 favor, -20% tech cost | [ ] |

### Blessing Effects (When Favor Thresholds Met) [ ]

**Jupiter** (King of Gods):
- 25%: +10% battle strength
- 50%: +100 denarii on victories
- 75%: +15% morale
- 100%: All blessings from all gods

**Mars** (War):
- 25%: -15% recruit costs
- 50%: +10% attack
- 75%: +50 supplies
- 100%: -30% casualties

**Venus** (Love):
- 25%: +10% happiness
- 50%: +15% population growth
- 75%: +10% trade prices
- 100%: +50 favor with all gods

**Ceres** (Agriculture):
- 25%: +20% grain production
- 50%: +30% all food
- 75%: -25% food consumption
- 100%: Immune to famine

**Mercury** (Commerce):
- 25%: +10% trade prices
- 50%: -20% tariffs
- 75%: +25% caravan profits
- 100%: -50% trade risk

**Minerva** (Wisdom):
- 25%: -15% tech costs
- 50%: +1 tech per 5 rounds
- 75%: +25% building efficiency
- 100%: +20 favor

---

## Territory/Map System

### Territory Levels [ ]
| Level | Name | Production Mult | Stability Bonus | Upgrade Cost |
|-------|------|-----------------|-----------------|--------------|
| 1 | Settlement | 1.0x | +0 | - |
| 2 | Town | 1.2x | +5 | 400 |
| 3 | City | 1.5x | +10 | 800 |
| 4 | Metropolis | 2.0x | +15 | 1500 |
| 5 | Capital Province | 3.0x | +25 | 3000 |

### Territory Buildings [ ]
| Building | Cost | Effects | Status |
|----------|------|---------|--------|
| Garrison | 300 | +15 defense, +10 stability, +50 troop cap | [ ] |
| Walls | 500 | +30 defense, +15 stability | [ ] |
| Arena | 350 | +15 happiness, +8 stability | [ ] |
| Roads | 400 | -15% trade risk, +10% income | [ ] |
| Local Temple | 200 | +10 piety, +15 happiness, +10 stability | [ ] |
| Forum | 450 | +15% income, +10 stability, market bonus | [ ] |
| Watchtower | 250 | +20 defense, +5 stability | [ ] |
| Granary | 350 | +100 food storage | [ ] |
| Census Office | 180 | +10% tax, -5 stability | [ ] |

### Territory Focus/Development Paths [~]
| Focus | Bonuses | Status |
|-------|---------|--------|
| Military Outpost | +30% defense, +20% troop recruit | [~] UI exists, effects not applied |
| Trade Hub | +15% trade prices, +20% tariff reduction | [~] UI exists, effects not applied |
| Breadbasket | +50% grain production | [~] UI exists, effects not applied |
| Mining District | +50% iron, +30% stone | [~] UI exists, effects not applied |

### Garrison System [ ]
- [ ] Assign troops to territories
- [ ] Recall troops from territories
- [ ] Garrison affects stability (+1 per 10 troops)
- [ ] Under-garrisoned territories lose stability over time
- [ ] Max garrison based on buildings (base 50, +50 per Garrison building)

### Territory Events [ ]
| Event | Condition | Effect | Status |
|-------|-----------|--------|--------|
| Uprising | stability < 30 | -30% garrison, -10 stability | [ ] |
| Prosperity | stability > 70 | +15% income | [ ] |
| Slave Revolt | random (5%) | -10% pop, -12 happiness, -15 stability | [ ] |
| Bandit Attack | garrison < 20 | -150 denarii, -8 stability | [ ] |
| Cultural Flourishing | random (8%) | +15 influence, +10 piety | [ ] |

### Governor System [x]
- [x] 5 governor types with traits
- [x] Assign governor to territory
- [x] Governor bonuses displayed
- [ ] Governor bonuses actually applied in calculations

---

## Other Systems (Future Import)

### Wonders [x]
- [x] 6 wonders defined
- [x] Multi-turn construction
- [x] Wonder effects applied

### Quests [x]
- [x] Quest types (build, conquer, trade, research, threshold)
- [x] Progress tracking
- [x] Rewards system

### Random Events [x]
- [x] 16 events (positive/negative/neutral)
- [x] Event effects applied
- [ ] Religious events (separate category)
- [ ] Territory events (separate category)

### Achievements [x]
- [x] ~20 achievements
- [x] Automatic checking
- [x] Rewards applied

### Emergency Actions [x]
- [x] 5 emergency actions
- [x] Cooldown system
- [x] Crisis detection

### Crafting [x]
- [x] 4 recipes
- [x] Resource costs
- [x] Temporary buffs

### Trade System [x]
- [x] Quick trade
- [x] Caravans with risk/reward
- [x] Trade routes
- [x] Market prices with supply/demand
- [x] Monte Carlo forecasting

### Battle System [x]
- [x] Conquest battles
- [x] Odds calculation
- [x] Bell curve visualization
- [x] Battle animations
- [ ] Divine blessings affecting battles
- [ ] Territory defense bonuses

---

## Implementation Priority

### Phase 1: Religion (Current Focus)
1. Religious buildings constant + UI
2. Additional worship actions
3. Blessing effects applied
4. Religious events
5. Battle integration

### Phase 2: Territory (Current Focus)
1. Territory levels + upgrade UI
2. Territory buildings
3. Garrison system
4. Territory events
5. Focus bonuses applied

### Phase 3: Integration
1. Governor bonuses in calculations
2. Divine blessings in battles
3. Territory defense in battles
4. Cross-system effects

---

## Reference Locations in Draft HTML

```
Religion:
- ROMAN_GODS definition: lines 2805-2860
- Religious buildings: lines 2862-2885
- Worship actions: lines 2888-2901
- Religious events: lines 2905-2923
- Blessing processing: lines 4870-4882
- Piety production: lines 4569-4592

Territory:
- TERRITORIES definition: lines 1608-1650
- Territory levels: lines 1653-1658
- Territory buildings: lines 1662-1703
- Governor traits: lines 1716-1748
- Territory events: lines 1753-1795
- Territory functions: lines 1798-2135
- Production calculations: lines 1840-1890
- Defense calculations: lines 1892-1918
- Income calculations: lines 1920-1950
```
