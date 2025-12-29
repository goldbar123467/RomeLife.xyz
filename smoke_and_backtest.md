# Smoke & Back Test Protocols

This document defines the required testing steps to be performed after every development stage to ensure game stability and logic integrity.

## 1. CLI Debug System

Implement the following `Debug` object globally in [Rome.life_Draft.html](file:///c:/Users/Clark/Desktop/Rome.Life/Rome.life_Draft.html) to facilitate testing.

```javascript
window.Debug = {
  // === Action Checks ===
  smoke: function() {
    console.group('🔥 SMOKE TEST');
    console.assert(window.S, 'State object (S) missing');
    console.assert(S.territories.length > 0, 'No territories found');
    console.assert(typeof S.denarii === 'number', 'Denarii is not a number');
    console.assert(document.getElementById('app'), 'App container missing');
    console.log('✅ Smoke test passed if no assertion errors above.');
    console.groupEnd();
  },

  // === State Manipulation ===
  addResources: function(type, amount) {
    if (!S.inventory) S.inventory = {};
    S.inventory[type] = (S.inventory[type] || 0) + amount;
    console.log(`Added ${amount} ${type}. New total: ${S.inventory[type]}`);
    if (typeof render === 'function') render();
  },

  setGold: function(amount) {
    S.denarii = amount;
    console.log(`Gold set to ${amount}`);
    if (typeof render === 'function') render();
  },

  // === Simulation ===
  fastForward: function(rounds = 1) {
    console.log(`⏩ Fast forwarding ${rounds} rounds...`);
    for (let i = 0; i < rounds; i++) {
        if (typeof endTurn === 'function') endTurn();
    }
  },

  // === Logic Verification (Backtest) ===
  checkIntegrity: function() {
    console.group('🔍 INTEGRITY CHECK (Backtest)');
    
    // 1. Resource Math Check
    const expectedProduction = Object.values(S.territoryData || {}).reduce((acc, t) => {
        // ... reimplement simplified calc logic here to verify against game state ...
        return acc; 
    }, 0);
    // Note: Complex to verify perfectly without duplicating all logic, 
    // but we can check for negatives or NaN.
    
    const hasNaN = Object.values(S).some(val => typeof val === 'number' && isNaN(val));
    console.assert(!hasNaN, '❌ State contains NaN values!');

    // 2. Territory Linkage
    const territoryCount = S.territories.length;
    const dataCount = Object.keys(S.territoryData).length;
    console.assert(territoryCount === dataCount, 
        `Mismatch: ${territoryCount} territories vs ${dataCount} data entries`);

    console.log('✅ Integrity check complete.');
    console.groupEnd();
  }
};
```

## 2. Smoke Test Checklist (Manual)

Perform these steps after any UI or Logic change:

1.  **Load**: Refresh the page. Ensure no console errors appear immediately.
2.  **Display**: Verify the Header shows "Founding of Rome".
3.  **Interaction**:
    *   Click the "Wolf" icon (Easter egg check).
    *   Toggle "Fast Battles" switch.
    *   Switch tabs (Overview -> Military -> Trade).
4.  **Game Loop**:
    *   Click "End Season". Verify Round counter increases.
    *   Verify resource numbers change (Production applied).

## 3. Back Test Checklist (Logic)

Perform these steps after major mechanical changes:

1.  **Economy Validation**:
    *   Open console. Run `Debug.setGold(0)`.
    *   End turn. Verify income > 0 (assuming positive cashflow).
    *   Verify `S.history` has a new entry.
2.  **Combat Logic**:
    *   Run `Debug.addResources('troops', 100)`.
    *   Trigger a battle (if possible via UI or `startBattle()`).
    *   Verify troops decrease after battle (casualties).
3.  **Save/Load Cycle**:
    *   Make a distinct change (e.g., `Debug.setGold(12345)`).
    *   Save Game.
    *   Reload Page.
    *   Load Game.
    *   Verify Gold is `12345`.

## 4. Automated Verification Command

Run this in the browser console to perform all automated checks:

```javascript
Debug.smoke(); Debug.checkIntegrity();
```
