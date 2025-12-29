# Core Math Structure & Methodology

This document defines the mathematical models, formulas, and logic systems that drive the game's economy, simulation, and progression.

## 1. Economy & Production

### Resource Production
Production is calculated per territory and summed for the global inventory.

**Formula:**
`Total Production = Sum(Base Amount * Development Multiplier * Building Multipliers * Governor Multiplier)`

*   **Base Amount**: Defined in `TERRITORIES` (e.g., Grain: 2, Iron: 1).
*   **Development Multiplier**: `TERRITORY_LEVELS`
    *   Level 1 (Settlement): 1.0x
    *   Level 2 (Town): 1.2x
    *   Level 3 (City): 1.5x
    *   Level 4 (Metropolis): 2.0x
    *   Level 5 (Capital): 3.0x
*   **Building Multipliers**:
    *   Granary: 1.3x (Food)
    *   Workshop: 1.4x (All)
    *   Advanced Mine: 2.0x (Iron), 1.5x (Stone)
    *   Farm Complex: 2.0x (Grain), 1.5x (Livestock)

### Income Generation
Denarii (currency) comes from territory taxes and trade buildings.

**Formula:**
`Territory Income = (Base Building Income + Path Bonus + Governor Bonus)`

*   **Buildings**:
    *   Marketplace: +50d
    *   Banking House: +200d
    *   Grand Market: +300d
    *   Counting House: +100d
*   **Paths**: Economic Focus (+100d/season)

### Market Pricing (Supply & Demand)
Prices fluctuate based on inventory levels and seasons.

**Base Price Logic:**
1.  **Demand Index** defaults to 100.
2.  **Inventory Impact**:
    *   Ratio > 0.7 (Oversupply): Demand drops (-5 to -15)
    *   Ratio < 0.3 (Scarcity): Demand rises (+5 to +15)
3.  **Random Fluctuation**: +/- 4
4.  **Seasonality**:
    *   Winter: Grain/Livestock demand +15
    *   Summer: Wine demand +10

**Final Price Formula:**
`Price = Base Price * (Demand Index / 100)`

## 2. Resource Consumption

### Food Consumption
**Formula:**
`Consumption = (Population * 0.42 + Troops * 0.55) * Seasonal Multiplier * Grace Multiplier`

*   **Seasonal Multiplier**:
    *   Summer: 0.95x
    *   Winter: Normal (1.0x) but production drops.
*   **Grace Multiplier**:
    *   Rounds 0-6: 0.6x
    *   Rounds 7-12: 0.8x
    *   Round 13+: 1.0x

## 3. Territory Stability & Events

### Stability Calculation
Ranges from 0 to 100. Base is 50.

**Modifiers:**
*   **Garrison**: +1 per turn if > 20 troops (max +100). -2 per turn if < 20 troops.
*   **Buildings**:
    *   Walls: +15
    *   Temple: +10
    *   Aqueduct: +15
*   **Governor Traits**: +15 to +25 depending on type.

### Event Probabilities
Events trigger every ~3 rounds per territory.

| Event | Chance | Condition | Effect |
| :--- | :--- | :--- | :--- |
| **Rebellion** | 5% | Stability < 30 | Stability -10, Garrison reduced |
| **Plague** | 3% | Sanitation < 30 | Pop -20%, Happiness -15 |
| **Prosperity** | 8% | Stability > 70 | Income +100d, Happiness +10 |
| **Bandit Raid** | 7% | Garrison < 20 | Gold loss, Stability -8 |

## 4. Probability & RNG

### Rarity System
Used for generating item/territory rarities.

| Rarity | Chance | Bonus Multiplier |
| :--- | :--- | :--- |
| **Common** | ~80% | 1.0x |
| **Uncommon** | 12% | 1.1x |
| **Rare** | 5% | 1.25x |
| **Epic** | 2.5% | 1.5x |
| **Legendary** | 0.5% | 2.0x |
| **Imperial** | 0.05% | 3.0x |

### Procedural Tech Generation
Uses `xorshift32` seeded RNG for consistent playthroughs (Seed: 1337).

**Tech Cost Range**: 200 - 1100 denarii
**Effect Types**:
*   Production (+10-25%)
*   Sell Prices (+1-3%)
*   Capacity (+10-40)
*   Happiness (+4-12)

## 5. Military Math

### Defense Rating
`Defense = Garrison Strength + Building Bonuses + Governor Bonus`

*   **Buildings**: Walls (+30), Garrison (+15)
*   **Focus**: Military (+25)

### Unit Values
*   **Militia**: Low cost (80d), Min/Max troops (8-12)
*   **Legionaries**: Med cost (140d), Min/Max troops (12-18)
*   **Praetorians**: High cost (400d), Min/Max troops (35-50)

## 6. Religion System

### Favor & Piety
*   **Piety**: Currency for religious actions.
*   **God Favor (0-100)**: Unlocks specific blessings at thresholds (25, 50, 75, 100).
*   **Worship**:
    *   Prayer: +5 Favor
    *   Sacrifice: +15 Favor (Costs Livestock)
    *   Festival: +25 Favor (High Cost)
