# Agent Playtest Guide: Gameplay Balance & Tuning

## Mission
**Objective:** Evaluate "Rome.Life" for **gameplay balance**, **pacing**, and **fun**.
**Role:** You are not just checking for bugs. You are checking for *fairness* and *enjoyment*.

**Input Documents:**
- `core_math_structure.md`: The "Theory" (Read this first).
- `gameqa.md`: The "Physics" (Ensure bugs don't interfere).

---

## 1. Setup & Configuration
1.  **Launch Game**: Open `http://localhost:3000/`.
2.  **Reset State**: Clear LocalStorage or click "Reset Game" if available to ensure a fresh start.
3.  **Tools**: Keep the browser DevTools open to monitor `console.log` for logic errors.

---

## 2. Playtest Scenarios (The 3 Personas)
Execute at least one of these runs to test specific systems.

### A. The Tycoon (Economy Balance)
**Goal:** Amass 5,000 Denarii by Round 20.
**Strategy:**
1.  Build only economic buildings (Marketplace, Banking House).
2.  Focus on Trade Routes (if available).
3.  Set Taxes to High (if possible).

**Balance Checks:**
- [ ] **Inflation:** Does money become meaningless? (e.g., >10k gold with nothing to buy).
- [ ] **Market Crash:** Can you crash the price of Grain by overproducing?
- [ ] **Taxes:** Is High Tax punishment (Unrest) too weak? (i.e., is it always optimal to tax max?).

### B. The General (Combat Balance)
**Goal:** Conquer "Veii" (Rare Territory) by Round 15.
**Strategy:**
1.  Recruit mainly **Centurions** or **Legionaries**.
2.  Research **Iron Working** (+Attack).
3.  Ignore Happiness/Religion unless critical.

**Balance Checks:**
- [ ] **Militia Spam:** Is 50 Militia cheaper/stronger than 10 Praetorians? (Should NOT be).
- [ ] **Defense:** Do enemy Garrisons scale too fast? (Is Veii impossible?).
- [ ] **Casualties:** Is the troop loss rate sustainable? or do you run out of manpower instantly?

### C. The Builder (Sustainability)
**Goal:** Reach Population 200 without Starvation.
**Strategy:**
1.  Focus on **Farms**, **Granaries**, and **Aqueducts**.
2.  Prioritize **Growth** and **Sanitation**.

**Balance Checks:**
- [ ] **Death Spiral:** If you hit 0 food, does the population die so fast you can't recover?
- [ ] **Housing Cap:** Is it too expensive to build housing for new citizens?
- [ ] **Growth Rate:** Does population grow painfully slow even with surplus food?

---

## 3. Red Flags (Tuning Metrics)
Report any of these immediately as "Imbalanced".

| Metric | "Good" Range | "Imbalanced" Flag |
| :--- | :--- | :--- |
| **Early Game Waiting** | Wait 1-3 ticks for resources | Wait >10 ticks frequently |
| **Gold Accumulation** | Linear growth | Exponential (doubles every few turns) |
| **Battle Odds** | Even Match (40-60%) feels risky | 90% Odds result in defeat often |
| **Event Frequency** | 1 Major Event every ~5-10 rounds | Events spam every round |

---

## 4. Subjective "Feel" Report
Include a section in your report for qualitative feedback:

*   **Pacing:** "The mid-game (Rounds 10-15) felt mostly like waiting."
*   **Clarity:** "I didn't know why my Happiness dropped."
*   **Agency:** "I felt like my decisions didn't matter; luck determined the outcome."
*   **Fun Factor:** "Conquering Antium felt rewarding."

---

## 5. Report Template
Use this format when submitting your Playtest Report:

```markdown
### Playtest Report: [Persona Name]
**Rounds Played:** 20
**Final Status:** 1500 Gold, 80 Pop, 2 Territories.

**Balance Feedback:**
1. [Economy] Marketplace income feels too high (ROI in 2 rounds).
2. [Combat] Veii defenses are too strong for early game units.

**Fun Factor:** 7/10
**Notes:** The trade route interface was tedious to use repeatedly.
```
