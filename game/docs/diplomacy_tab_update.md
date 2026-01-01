# Diplomacy Tab: Additive Design Expansion

**Document Version:** 1.0
**Author:** Imperator Agent
**Date:** 2026-01-01
**Status:** Design Specification (No Code Changes)

---

## 1. Existing System Respect Statement

### What Diplomacy Represents

The Diplomacy system in Rome Empire Builder represents **Rome's external relations with neighboring powers**. It models the complex web of alliances, enmities, and strategic partnerships that defined Rome's rise. The system currently tracks:

- **Five Factions**: Alba Longa (mother city), Sabine Tribes (hill people), Etruscans (northern power), Latin League (confederation), Greek Colonies (southern settlements)
- **Relation Values**: 0-100 scale per faction, with status tiers (Hostile < 20, Unfriendly < 40, Neutral < 60, Friendly < 80, Allied >= 80)
- **Envoy Mechanic**: 100 denarii cost to attempt relation improvement, success modified by reputation and god blessings
- **Passive Effects**: Allied status grants +20% trade prices and military support; Hostile triggers embargoes and raid risk
- **Relation Decay**: Natural drift toward equilibrium each season via `calculateRelationDecay()`

### Assumptions Not To Be Violated

1. **Faction relations remain the core currency** - The 0-100 scale is the source of truth
2. **Envoy actions are the primary relation-improvement mechanism** - No new "fast track" diplomacy bypasses
3. **Relation decay creates ongoing pressure** - Players cannot achieve permanent diplomatic states
4. **Reputation influences diplomatic outcomes** - The reputation stat must remain causally linked
5. **Trade bonuses are tied to relation thresholds** - The 60+/80+ tiers are meaningful gates
6. **Senate system handles internal politics** - Diplomacy is explicitly external (factions, not senators)
7. **Resource costs create real decisions** - Envoys cost denarii, limiting spam
8. **Uncertainty exists in envoy outcomes** - Success is probabilistic, not guaranteed

### How This Proposal Stays Additive

This document proposes **only UI additions and visibility enhancements** that:
- Display existing state more clearly
- Surface causal relationships already computed
- Add flavor and context without changing mechanics
- Create new player questions without answering them
- Expand content variety without altering balance

**What this document does NOT propose:**
- New diplomatic actions that bypass envoys
- Changes to relation thresholds or effects
- Modifications to decay calculations
- New resources or currencies
- Balance adjustments to existing systems
- Code changes or implementation tasks

---

## 2. Expansion Intent

### Emotional Depth Goals

The current DiplomacyPanel displays relations as simple progress bars. This expansion aims to make diplomacy feel like **navigating a living political landscape**:

- **Historical Weight**: Each faction should feel like it has centuries of context with Rome
- **Personal Stakes**: Players should understand what they risk losing with each faction
- **Temporal Pressure**: The slow drift of relations should feel urgent and consequential
- **Strategic Uncertainty**: Players should weigh probabilities, not calculate certainties

### Strategic Depth Goals

Diplomacy should present **meaningful choices without obvious correct answers**:

- When to spend limited denarii on envoys vs. military expansion
- Which faction to prioritize when multiple relations are declining
- Whether to maintain broad neutrality or pursue deep alliances
- How to respond to faction-specific pressures and opportunities

### Avoiding Power Creep

All expansions reinforce existing causal chains rather than creating shortcuts:

- More information about WHY relations change (not faster relation gains)
- More context about faction priorities (not new ways to manipulate them)
- More visibility into consequences (not mitigation of those consequences)
- More flavor and narrative (not mechanical advantages)

### Reinforcing Causality

Every UI element should answer questions that lead to more questions:

- "Why did relations drop?" leads to "What actions caused this?"
- "What does this faction want?" leads to "Can I afford to give it?"
- "What happens if I ignore them?" leads to "When does that become dangerous?"

---

## 3. Additive UI Expansion (Shadcn/ui First-Class)

### 3.1 Card Component Expansions

#### Faction Detail Card (Enhanced GlassCard)
**Existing System Reflected:** `DiplomacyState.relations[factionId]` and faction metadata
**Information Made Visible:**
- Full faction history and context (currently only name/description shown)
- Relationship trajectory over recent seasons
- List of known faction priorities and grievances
- Current stance interpretation text

**Player Questions Created:**
- "What does this faction actually care about?"
- "Is our relationship improving or declining over time?"
- "What historical events shaped their view of Rome?"

**Implementation Pattern:**
```
<Card>
  <CardHeader>
    <CardTitle>Faction Name</CardTitle>
    <CardDescription>Historical context paragraph</CardDescription>
  </CardHeader>
  <CardContent>
    - Relation bar with trend indicator
    - Recent history list (last 4 seasons)
    - Faction priorities section
  </CardContent>
  <CardFooter>
    - Status badge
    - Available actions hint
  </CardFooter>
</Card>
```

#### Diplomatic Summary Card
**Existing System Reflected:** Aggregate of all `DiplomacyState.relations`
**Information Made Visible:**
- Count of factions by tier (Hostile/Unfriendly/Neutral/Friendly/Allied)
- Overall diplomatic "health" derived from weighted average
- Number of active envoys and their destinations

**Player Questions Created:**
- "Am I overextended diplomatically?"
- "Which relationships need the most attention?"
- "What's my overall standing in the Mediterranean world?"

### 3.2 Tabs Component

#### Faction Tabs (Within Diplomacy Panel)
**Existing System Reflected:** The five factions in `diplomacy.relations`
**Information Made Visible:**
- Each faction gets its own sub-panel for deep exploration
- Tab badges show danger/opportunity indicators
- Tab ordering could reflect urgency (declining relations first)

**Player Questions Created:**
- "Which faction should I focus on this season?"
- "Why is one tab highlighted as urgent?"

**Implementation Pattern:**
```
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="alba_longa">Alba Longa</TabsTrigger>
    <TabsTrigger value="sabines">Sabines</TabsTrigger>
    <TabsTrigger value="etruscans">Etruscans</TabsTrigger>
    <TabsTrigger value="latins">Latins</TabsTrigger>
    <TabsTrigger value="greeks">Greeks</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview Cards</TabsContent>
  <TabsContent value="alba_longa">Faction Detail</TabsContent>
  ...
</Tabs>
```

### 3.3 Badge Component Expansions

#### Relation Trend Badge
**Existing System Reflected:** Computed delta between current and previous season's relation values
**Information Made Visible:**
- "Rising", "Stable", "Falling" with directional arrow
- Magnitude indicator (slow/fast drift)

**Player Questions Created:**
- "Is this relationship naturally recovering or declining?"
- "How quickly do I need to act?"

#### Faction Stance Badge
**Existing System Reflected:** Relation tier thresholds
**Information Made Visible:** Current tier name with appropriate coloring
**Player Questions Created:** "What benefits/penalties am I currently receiving?"

#### Risk Badge
**Existing System Reflected:** Hostile faction effects (embargo, raid risk)
**Information Made Visible:** Active negative effects from hostile relations
**Player Questions Created:** "What am I losing by ignoring this faction?"

### 3.4 Alert Component

#### Diplomatic Crisis Alert
**Existing System Reflected:** Faction relations approaching Hostile threshold (< 25)
**Information Made Visible:**
- Warning when any faction is close to Hostile
- Specific faction name and current value
- Historical reason for decline (if trackable)

**Player Questions Created:**
- "How did this get so bad?"
- "What happens if I don't fix it?"

#### Opportunity Alert
**Existing System Reflected:** Faction relations approaching Allied threshold (> 75)
**Information Made Visible:**
- Notification when alliance is within reach
- Benefits of achieving Allied status
- Cost estimate for final push

**Player Questions Created:**
- "Is it worth spending denarii to push for alliance?"
- "What will I gain that I don't have now?"

**Implementation Pattern:**
```
<Alert variant="warning">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Relations Deteriorating</AlertTitle>
  <AlertDescription>
    Your relationship with the Etruscans has fallen to 28.
    Below 20, trade will be embargoed.
  </AlertDescription>
</Alert>
```

### 3.5 Dialog Component

#### Faction Detail Dialog
**Existing System Reflected:** Full faction definition and current state
**Information Made Visible:**
- Extended historical narrative
- Leader description and motivations (flavor)
- Complete relationship history
- Strategic assessment text

**Player Questions Created:**
- "What is this faction's long-term goal?"
- "How have our relations evolved over the game?"
- "What leverage do I have?"

#### Envoy Dispatch Dialog
**Existing System Reflected:** `executeSendEnvoy()` parameters and outcomes
**Information Made Visible:**
- Current success probability (without exact number)
- Factors affecting success (reputation, god blessings)
- Potential outcomes (range, not guarantee)
- Cost confirmation

**Player Questions Created:**
- "Is my reputation high enough to risk this?"
- "Should I wait for better conditions?"
- "What's the worst that could happen?"

**Implementation Pattern:**
```
<Dialog>
  <DialogTrigger>Send Envoy</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dispatch Envoy to Sabines</DialogTitle>
      <DialogDescription>
        An envoy costs 100 denarii and may improve or harm relations.
      </DialogDescription>
    </DialogHeader>
    - Success factors display
    - Risk assessment
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="default">Send Envoy (100d)</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 3.6 Tooltip Component

#### Relation Factor Tooltips
**Existing System Reflected:** Components of `calculateEnvoySuccess()` and `calculateRelationDecay()`
**Information Made Visible:**
- Hover over relation bar to see contributing factors
- Reputation influence
- God blessing influence
- Recent action impacts

**Player Questions Created:**
- "Why is my success chance what it is?"
- "What can I change to improve my odds?"

#### Tier Threshold Tooltips
**Existing System Reflected:** The 20/40/60/80 thresholds and their effects
**Information Made Visible:**
- Hover over tier badge to see exact threshold
- Effects gained at next tier up
- Effects lost if dropping to next tier down

**Player Questions Created:**
- "How close am I to the next threshold?"
- "What will I gain/lose?"

### 3.7 HoverCard Component

#### Faction Leader HoverCard
**Existing System Reflected:** Faction flavor data (can be expanded in constants)
**Information Made Visible:**
- Leader name and title (flavor)
- Portrait placeholder
- Brief personality description
- Known preferences and dislikes

**Player Questions Created:**
- "Who am I actually dealing with?"
- "What kind of approach might work?"

#### Historical Event HoverCard
**Existing System Reflected:** Would require new derived state tracking significant events
**Information Made Visible:**
- Key moments in the relationship
- Causes of major relation changes
- Timeline of interactions

**Player Questions Created:**
- "What caused that big drop in Year 3?"
- "When did we become friends?"

### 3.8 Progress Component

#### Relation Progress Bar (Enhanced)
**Existing System Reflected:** `diplomacy.relations[factionId]`
**Information Made Visible:**
- Marked threshold points (20, 40, 60, 80)
- Current position with exact value on hover
- Trend direction arrow
- "Distance to next tier" indicator

**Player Questions Created:**
- "How far am I from friendly status?"
- "How much buffer do I have before hostile?"

#### Diplomatic Momentum Indicator
**Existing System Reflected:** Computed from recent relation changes
**Information Made Visible:**
- Overall diplomatic trajectory (improving/stable/declining)
- Rate of change visualization

**Player Questions Created:**
- "Are things generally getting better or worse?"
- "Do I need to take action or let things stabilize?"

### 3.9 Accordion Component

#### Faction History Accordion
**Existing System Reflected:** Would require new event log for diplomatic actions
**Information Made Visible:**
- Season-by-season breakdown of relation changes
- Causes for each change (envoy, decay, event)
- Collapsible to manage complexity

**Player Questions Created:**
- "What exactly caused this decline?"
- "How effective have my envoys been?"

#### Diplomatic Effects Accordion
**Existing System Reflected:** Trade bonuses, military support, embargo status
**Information Made Visible:**
- Active bonuses from friendly/allied factions
- Active penalties from unfriendly/hostile factions
- Collapsed by default, expandable for detail

**Player Questions Created:**
- "What am I actually getting from this alliance?"
- "What's the real cost of this enmity?"

### 3.10 Toast Component

#### Envoy Result Toast
**Existing System Reflected:** Result of `executeSendEnvoy()`
**Information Made Visible:**
- Success/failure notification
- Relation change amount
- New relation tier (if changed)

**Player Questions Created:** (Retrospective)
- "Did that work?"
- "How much did it help/hurt?"

#### Diplomatic Event Toast
**Existing System Reflected:** Seasonal diplomatic events and relation changes
**Information Made Visible:**
- Notification when relations cross threshold
- Notification when faction stance changes
- Brief explanation of cause

**Player Questions Created:**
- "What just happened?"
- "Why did that change?"

### 3.11 Command Component

#### Diplomatic Quick Actions (Command Palette Style)
**Existing System Reflected:** Available diplomatic actions
**Information Made Visible:**
- Searchable list of factions and available actions
- Quick access to envoy dispatch
- Keyboard navigation support

**Player Questions Created:**
- "What can I do right now?"
- "Which actions are available/blocked?"

---

## 4. Content Density Expansion

### 4.1 New Diplomatic Actions (Routing Through Existing Systems)

The following actions are **variants of the existing envoy system**, not new mechanics. They represent narrative framing around the same underlying `executeSendEnvoy()` with potential modifier adjustments.

#### Trade Delegation
**Trigger:** Allied status with faction AND positive trade balance
**Dependencies:** `diplomacy.relations[faction] >= 80` AND `totalTrades > 0`
**Uncertainty:** Same probability calculation as standard envoy
**Consequences:** Slightly larger relation gain on success, minor denarii gain on failure (they still appreciate the goods)
**Narrative:** "A trade delegation carries samples of your finest goods, demonstrating Rome's prosperity and reliability as a partner."

#### Military Emissary
**Trigger:** Recent victory AND faction has military concerns
**Dependencies:** `totalConquests > 0` OR `winStreak > 0`
**Uncertainty:** Modified by military strength, not just reputation
**Consequences:** Can improve relations more with militaristic factions (Sabines, potential Etruscan subfactions)
**Narrative:** "A veteran centurion visits their camps, sharing tales of Roman valor and offering assurances of protection."

#### Religious Ambassador
**Trigger:** High piety AND patron god selected
**Dependencies:** `piety >= 50` AND `patronGod !== null`
**Uncertainty:** Modified by piety stat
**Consequences:** More effective with religiously-aligned factions; ties diplomacy to religion system
**Narrative:** "A priest of [patron god] carries sacred offerings and prayers for shared prosperity between our peoples."

### 4.2 Contextual Flavor Events

These events **do not change gameplay** but add narrative texture. They would appear as informational panels, not action choices.

#### Seasonal Diplomatic News
**Trigger:** Start of each season
**Content:** Brief flavor text about what's happening with each faction
- "Alba Longa celebrates a harvest festival. Their spirits are high."
- "Etruscan traders have been seen near our borders, assessing our markets."
- "The Sabine chieftain's son has come of age and seeks to prove himself in battle."

#### Milestone Recognition
**Trigger:** Relation crosses threshold
**Content:** Narrative explanation of what this means
- "Reaching Friendly status with the Latins opens discussions of mutual defense."
- "The Greeks now view Rome as a serious trading partner, not a backwater village."

### 4.3 Conditional Prompts

These prompts appear when specific conditions are met, **inviting action without recommending it**.

#### Crisis Prompt
**Condition:** Any faction relation < 25 AND `denarii >= 100`
**Prompt:** "Relations with [faction] are critically low. An envoy could be sent, though success is uncertain."
**NOT:** "Send an envoy immediately to prevent crisis!"

#### Opportunity Prompt
**Condition:** Any faction relation > 75 AND `denarii >= 100`
**Prompt:** "The [faction] are receptive. This may be an opportune moment for diplomacy."
**NOT:** "Alliance is within reach! Send an envoy now!"

#### Resource Warning
**Condition:** Multiple factions declining AND `denarii < 200`
**Prompt:** "Multiple relationships are deteriorating. Diplomatic efforts require resources."
**NOT:** "You can't afford to fix your diplomatic problems!"

---

## 5. Causal Visibility Enhancements

### 5.1 "Recent Causes" Panel

A collapsible section showing **why** the current relation value exists:

#### Structure
```
Recent Diplomatic History - Sabines
=====================================
This Season:
  - Natural decay: -2 (relations drift toward 50)
  - No envoys sent

Last Season:
  - Envoy sent: SUCCESS (+8)
  - Natural decay: -2

Two Seasons Ago:
  - No diplomatic actions
  - Natural decay: -2
  - Event: Border skirmish (-5)

Net change over 4 seasons: -3
Current relation: 42 (Neutral, was 45)
```

#### What This Shows
- The `calculateRelationDecay()` output made visible
- Envoy results tracked
- Events (when implemented) attributed
- Clear causal chain from past to present

### 5.2 Projection Display

Show where relations are **heading**, not where they will end up:

#### Decay Projection
"At current rates, relations with the Etruscans will reach Unfriendly in approximately 4 seasons."

**Implementation Notes:**
- Calculate based on `calculateRelationDecay()` applied repeatedly
- Show as estimate, not guarantee
- Include uncertainty language: "approximately", "if unchanged"

#### Threshold Warning
"Relations are 6 points above the Unfriendly threshold. One failed envoy could push you below."

### 5.3 Delta Explanations

Every displayed change should have an explanation available:

#### Relation Change Breakdown
When displaying "+5 relations this season":
```
Breakdown:
  - Envoy to Sabines: +8 (success)
  - Natural decay: -2 (drifting toward equilibrium)
  - Reputation bonus: +0 (reputation at 50)
  = Net: +6 (displayed as +5 after rounding)
```

#### Factor Visibility
Show what affects success probability:
```
Envoy Success Factors:
  - Base chance: 50%
  - Reputation modifier: +10% (reputation 70)
  - Current relations modifier: +5% (they like you)
  - Venus blessing: +5% (if applicable)
  = Approximate chance: Good
```

Note: Do NOT show exact percentage. Use qualitative terms:
- "Very Likely" (> 80%)
- "Likely" (60-80%)
- "Uncertain" (40-60%)
- "Unlikely" (20-40%)
- "Very Unlikely" (< 20%)

### 5.4 Trust/Fear/Leverage Indicators

Three derived indicators that reflect relationship dynamics:

#### Trust
**Derived From:** Relation value + history of successful deals + consistency
**Displayed As:** Qualitative assessment
"The Sabines have come to trust Rome's word, though they remain cautious."

#### Fear
**Derived From:** Military strength relative to faction + aggressive actions
**Displayed As:** Qualitative assessment
"The Greeks fear Roman expansion but are not yet intimidated."

#### Leverage
**Derived From:** Trade dependency + strategic position + resources they need
**Displayed As:** Qualitative assessment
"Rome controls salt supplies the Latins depend on, providing some leverage."

**Critical:** These are **interpretation aids**, not actionable resources. They help players understand the situation, not manipulate it.

---

## 6. Interactive CTA Philosophy

### 6.1 CTAs That Invite (Not Recommend)

#### Correct Patterns

**Envoy Button:**
- Label: "Send Envoy (100d)"
- Tooltip: "Attempt to improve relations. Outcome uncertain."
- NOT: "Improve Relations Now!"

**Faction Card Action:**
- Label: "View Details"
- Tooltip: "Learn more about this faction and your history with them."
- NOT: "See How to Improve!"

**Alert Dismiss:**
- Label: "Acknowledge"
- NOT: "I'll Handle It"

### 6.2 Conditional Visibility

CTAs appear based on conditions, not always visible:

**Envoy Button:**
- Visible when: `denarii >= 100`
- Disabled (with explanation) when: `denarii < 100`
- Hidden when: Would add clutter without value

**Special Envoy Types:**
- Visible when: Conditions met (victory for military emissary, etc.)
- NOT visible by default with "locked" appearance

### 6.3 Forbidden Language

The following patterns MUST NOT appear:

- "Best move: ..."
- "Optimal strategy: ..."
- "Recommended: ..."
- "You should ..."
- "Click here to win"
- "Maximize your ..."
- "The smart choice is ..."
- Success percentages displayed as numbers
- Guaranteed outcome promises
- "Easy" or "hard" difficulty labels on actions

### 6.4 Risk and Uncertainty Display

All actions should communicate uncertainty:

**Instead of:** "Send Envoy (+8 relations)"
**Use:** "Send Envoy (100d) - Outcome depends on reputation and current standing"

**Instead of:** "Success: 73%"
**Use:** "Prospects: Favorable" or "The envoy's chances appear good"

**Instead of:** "This will make them Allied"
**Use:** "Success would bring you closer to alliance, though the threshold is still some distance away"

---

## 7. Non-Invasive State Requirements

### 7.1 Derived State to Display

The following can be computed from existing state without modification:

#### Relation Trend
```typescript
// Computed from history (would need tracking added)
type RelationTrend = 'rising' | 'stable' | 'falling';
function getRelationTrend(history: number[]): RelationTrend
```

#### Distance to Threshold
```typescript
// Pure computation from current relation
function getDistanceToThreshold(relation: number, direction: 'up' | 'down'): number
```

#### Decay Projection
```typescript
// Iterative application of existing calculateRelationDecay
function projectDecaySeasons(current: number, targetThreshold: number): number
```

#### Success Probability Tier
```typescript
// Existing calculation, binned into qualitative tier
function getSuccessTier(reputation: number, relation: number, godBonus: number): QualitativeTier
```

### 7.2 Selectors/Computed Views Needed

These would be pure functions that derive display state:

```typescript
// Faction display data aggregator
function getFactionDisplayData(state: GameState, factionId: string): FactionDisplayData

// Diplomatic health summary
function getDiplomaticHealth(state: GameState): DiplomaticHealth

// Crisis detection
function getDiplomaticCrises(state: GameState): Crisis[]

// Opportunity detection
function getDiplomaticOpportunities(state: GameState): Opportunity[]
```

### 7.3 What Must Remain Immutable

The following MUST NOT be modified by UI components:

- `diplomacy.relations` - Only modified by `executeSendEnvoy()` and `executeEndSeason()`
- `diplomacy.activeEnvoys` - Only modified by envoy actions
- Any state that affects game mechanics

### 7.4 What UI Must Never Directly Manipulate

- Relation values
- Success probabilities
- Decay rates
- Threshold values
- Faction definitions
- Any calculated bonus

The UI is a **lens**, not a **lever**.

---

## 8. Accessibility and UX

### 8.1 Keyboard Support

#### Focus Management
- Tab navigation through all interactive elements
- Arrow keys for faction selection
- Enter/Space to activate buttons
- Escape to close dialogs/modals

#### Shortcuts
- Number keys 1-5 could select faction tabs (if tabs implemented)
- 'E' could focus envoy action (when available)
- '?' could show help overlay

### 8.2 Focus Behavior

#### Dialog Focus
- Focus trapped within modal dialogs
- Initial focus on primary action or close button
- Return focus to trigger element on close

#### Card Focus
- Focus indicators visible on all interactive cards
- Focus order follows visual order
- Skip navigation for repeated patterns

### 8.3 Readability

#### Text Hierarchy
- Faction names: Large, bold, high contrast
- Status text: Medium, clear differentiation by state
- Explanatory text: Smaller but still legible (minimum 12px)
- Numeric values: Tabular numerals for alignment

#### Color Usage
- Not color-alone for meaning (always paired with text/icon)
- Sufficient contrast ratios (WCAG AA minimum)
- Consistent color meanings across UI

#### Information Density
- Progressive disclosure via accordions/dialogs
- Most important info visible by default
- Details available on demand, not overwhelming

### 8.4 Discoverability Without Simplification

#### Tooltips for Learning
- Every unfamiliar term has a tooltip
- First-time visitors see contextual hints
- Hints dismissible and not repeated

#### Help System
- "?" icons open contextual help
- Help explains mechanics without prescribing strategy
- Examples use hypothetical scenarios

#### Visual Hierarchy
- Primary actions visually prominent
- Secondary information visually receded
- Emergency states visually distinct

---

## 9. Guardrails

### 9.1 Things Design Must NEVER Do

#### Never Recommend Optimal Actions
The UI must not tell players what to do. It shows state, consequences, and possibilities.

**Forbidden:**
- "Best target: Sabines"
- "Priority: Send envoy to Etruscans"
- "Recommended allocation: 50% to Greeks"

#### Never Guarantee Outcomes
All outcomes have uncertainty. The UI must communicate this.

**Forbidden:**
- "This will succeed"
- "Guaranteed +8 relations"
- "100% safe investment"

#### Never Hide Negative Consequences
Players must be able to see risks and downsides.

**Forbidden:**
- Showing only upside of actions
- Hiding decay information
- Obscuring crisis warnings

#### Never Override Player Agency
The game plays the player's choices, not its own optimizations.

**Forbidden:**
- Auto-dispatching envoys
- Automatic diplomatic responses
- AI-suggested actions presented as defaults

### 9.2 Patterns That Break Causality

#### Outcome Determinism
If the UI shows exact success percentages, players will reload saves to game the RNG. Show qualitative tiers instead.

#### Instant Feedback Loops
If actions immediately resolve with visible results, the weight of decisions diminishes. Maintain uncertainty until resolution.

#### Information Asymmetry Exploitation
If the UI reveals hidden faction state, it removes the simulation's depth. Show only what Rome would plausibly know.

### 9.3 UI Behaviors Undermining Agency

#### Notification Overload
Too many alerts trains players to ignore them. Reserve alerts for genuine crises.

#### Decision Paralysis
Too much information without hierarchy overwhelms. Lead with summary, reveal details on demand.

#### False Urgency
Constant "act now!" messaging undermines strategic planning. Let players set their own pace.

#### Paternalistic Framing
"Are you sure?" on every action insults player intelligence. Reserve for truly irreversible decisions.

---

## 10. Implementation Readiness

### 10.1 Likely Files for UI Expansion

The following files would likely be modified in a future implementation sprint:

**Primary Panel:**
- `/home/clark/romelife/game/src/components/game/DiplomacyPanel.tsx` - Main panel component

**Supporting Components (New):**
- `components/diplomacy/FactionCard.tsx` - Enhanced faction display
- `components/diplomacy/FactionDetail.tsx` - Modal/dialog for deep faction info
- `components/diplomacy/DiplomaticSummary.tsx` - Overview statistics
- `components/diplomacy/RelationHistory.tsx` - Historical tracking display
- `components/diplomacy/EnvoyDialog.tsx` - Envoy dispatch confirmation

**Type Definitions:**
- `/home/clark/romelife/game/src/core/types/index.ts` - Extended DiplomacyState type

**Constants:**
- `/home/clark/romelife/game/src/core/constants/` - New diplomacy.ts for faction lore

**Selectors/Computed:**
- `src/core/selectors/diplomacy.ts` - Pure derived state functions

**Use Cases:**
- `/home/clark/romelife/game/src/app/usecases/index.ts` - No changes to core logic

### 10.2 Integration Points

**Tab Navigation:**
- `/home/clark/romelife/game/src/components/game/TabNavigation.tsx` - Diplomacy tab already exists

**Store Access:**
- `/home/clark/romelife/game/src/store/gameStore.ts` - Read-only access for display

**UI Components:**
- `/home/clark/romelife/game/src/components/ui/` - shadcn/ui components already available

### 10.3 Dependencies

**Required UI Components (Already Present):**
- GlassCard, Button, Badge - Confirmed in existing code
- ProgressBar, SectionHeader - Confirmed in existing code
- Motion (framer-motion) - Confirmed in existing code

**Additional shadcn/ui Components (May Need Installation):**
- Tabs, TabsList, TabsTrigger, TabsContent
- Dialog, DialogContent, DialogHeader, etc.
- Alert, AlertTitle, AlertDescription
- Accordion, AccordionItem, AccordionTrigger
- HoverCard, HoverCardTrigger, HoverCardContent
- Tooltip, TooltipTrigger, TooltipContent
- Command, CommandInput, CommandList
- Toast (via sonner or similar)

### 10.4 State Tracking Additions

**For Full Feature Set, Would Need:**
- Relation history per faction (array of past values)
- Envoy attempt history (success/failure, when)
- Event attribution (what caused relation changes)

These would require small additions to `DiplomacyState` in types and corresponding tracking in use cases.

---

## Design Philosophy Summary

### The Diplomacy Tab as a Lens

The Diplomacy tab is not a control panel for optimizing faction relations. It is a **lens into Rome's place in the world**:

- **Reveals pressures** - Shows what is happening and why
- **Surfaces tensions** - Makes clear when things are deteriorating
- **Suggests possibilities** - Indicates what actions exist, not which to take
- **Exposes tradeoffs** - Every choice has costs and uncertain benefits
- **Makes consequences legible** - Past actions visibly shape present state

### What the UI Should NOT Do

- **Solve decisions** - The player chooses, the simulation responds
- **Collapse complexity** - Multiple factors remain multiple factors
- **Hide uncertainty** - Risk is real and communicated
- **Guarantee outcomes** - Nothing is certain in politics

### The Player's Role

The player is a Roman leader navigating a complex world with imperfect information and limited resources. The UI serves to:
1. Show them what they know
2. Help them understand what it means
3. Present what they can do
4. Let them decide what they will do

The simulation then plays out their choices with appropriate uncertainty and consequence.

---

*This proposal is strictly additive.*
*No existing systems, mechanics, or causal links are altered.*

---

## 11. Current Issues to Fix (Sprint Scope)

**Audit Date:** 2026-01-01
**Auditor:** Queen (Imperator) Agent
**Files Reviewed:**
- `/home/clark/romelife/game/src/components/game/DiplomacyPanel.tsx` (167 lines)
- `/home/clark/romelife/game/src/store/gameStore.ts` (1756 lines)
- `/home/clark/romelife/game/src/app/usecases/index.ts` (1052 lines)
- `/home/clark/romelife/game/src/core/types/index.ts` (475 lines)
- `/home/clark/romelife/game/src/core/math/index.ts` (diplomacy calculations)

### Critical Bugs

**BUG-D001: No Relation History Tracking**
- **Severity:** High
- **Location:** `DiplomacyState` type and `gameStore.ts`
- **Issue:** The `DiplomacyState` interface only tracks `relations: Record<string, number>` and `activeEnvoys: number`. There is no history array tracking relation changes over time.
- **Impact:** Cannot show trends, cannot display "Recent Causes" panel, cannot implement projections.
- **Design Reference:** Section 5.1 requires "Recent Causes" panel with season-by-season breakdown.

**BUG-D002: Envoy Results Not Logged**
- **Severity:** High
- **Location:** `executeSendEnvoy()` in `usecases/index.ts`
- **Issue:** Envoy success/failure outcomes are only returned in `message` string. No structured event log is maintained.
- **Impact:** Cannot show envoy history, cannot attribute relation changes to specific actions.
- **Design Reference:** Section 5.1 requires tracking "Envoy sent: SUCCESS (+8)" style entries.

**BUG-D003: Hardcoded Faction Data in Component**
- **Severity:** Medium
- **Location:** `DiplomacyPanel.tsx` lines 12-18
- **Issue:** Faction definitions (name, description, icon) are hardcoded in the component rather than centralized in constants.
- **Impact:** Inconsistent with architecture pattern used elsewhere (TERRITORIES, GODS, etc. are in constants).
- **Code:**
```typescript
const factions = [
    { id: 'alba_longa', name: 'Alba Longa', description: 'Our mother city, Latin allies', icon: 'temple' },
    // ...etc
];
```

### UI/UX Issues

**UI-D001: No Loading State for Envoy Action**
- **Severity:** Low
- **Location:** `DiplomacyPanel.tsx` lines 108-115
- **Issue:** The "Send Envoy" button has no feedback between click and result display. User cannot tell if action registered.
- **Design Reference:** Section 3.10 specifies Toast notifications for envoy results.

**UI-D002: No Confirmation Dialog for Envoy**
- **Severity:** Medium
- **Location:** `DiplomacyPanel.tsx` "Send Envoy" button
- **Issue:** Clicking "Send Envoy" immediately spends 100 denarii with no confirmation. This violates the design's "Envoy Dispatch Dialog" specification.
- **Design Reference:** Section 3.5 specifies Dialog with success factors display and risk assessment.

**UI-D003: Missing Threshold Markers on Progress Bars**
- **Severity:** Low
- **Location:** `DiplomacyPanel.tsx` lines 94-105
- **Issue:** The `ProgressBar` component is used without threshold markers at 20/40/60/80 points.
- **Design Reference:** Section 3.8 specifies "Marked threshold points (20, 40, 60, 80)".

**UI-D004: Static Faction Order**
- **Severity:** Low
- **Location:** `DiplomacyPanel.tsx` faction rendering
- **Issue:** Factions always display in hardcoded array order. Design suggests ordering by urgency (declining relations first).
- **Design Reference:** Section 3.2 mentions "Tab ordering could reflect urgency".

**UI-D005: No Trend Indicator**
- **Severity:** Medium
- **Location:** `DiplomacyPanel.tsx` faction cards
- **Issue:** No visual indication whether relations are rising, stable, or falling.
- **Design Reference:** Section 3.3 specifies "Relation Trend Badge" with directional arrow.

**UI-D006: Trade Bonus Badge Position**
- **Severity:** Low
- **Location:** `DiplomacyPanel.tsx` lines 117-119
- **Issue:** "Trade Bonus Active" badge only shows at 80+ but there's no indication of what bonus is at 60+.
- **Code:**
```typescript
{relation >= 80 && (
    <Badge variant="success" size="sm">Trade Bonus Active</Badge>
)}
```

### Missing Features

**FEAT-D001: No Faction Detail View**
- **Design Reference:** Section 3.5 "Faction Detail Dialog"
- **Status:** Not implemented
- **What's Missing:** Extended historical narrative, leader description, complete relationship history, strategic assessment text.

**FEAT-D002: No Diplomatic Summary Card**
- **Design Reference:** Section 3.1 "Diplomatic Summary Card"
- **Status:** Not implemented
- **What's Missing:** Count of factions by tier, overall diplomatic "health", number of active envoys with destinations.

**FEAT-D003: No Crisis/Opportunity Alerts**
- **Design Reference:** Section 3.4 "Diplomatic Crisis Alert" and "Opportunity Alert"
- **Status:** Not implemented
- **What's Missing:** Warning when faction < 25, notification when faction > 75.

**FEAT-D004: No Faction Tabs**
- **Design Reference:** Section 3.2 "Faction Tabs (Within Diplomacy Panel)"
- **Status:** Not implemented
- **What's Missing:** Sub-tabs for Overview and each faction.

**FEAT-D005: No Success Probability Display**
- **Design Reference:** Section 3.5 "Envoy Dispatch Dialog"
- **Status:** Not implemented
- **What's Missing:** Qualitative success tier (Likely, Uncertain, Unlikely) based on reputation and current relations.

**FEAT-D006: No Decay Projection**
- **Design Reference:** Section 5.2 "Projection Display"
- **Status:** Not implemented
- **What's Missing:** "At current rates, relations will reach Unfriendly in ~4 seasons".

**FEAT-D007: No Diplomatic Effects Accordion**
- **Design Reference:** Section 3.9 "Diplomatic Effects Accordion"
- **Status:** Partially implemented as static "Diplomatic Effects" card (lines 129-150)
- **What's Missing:** Collapsible accordion with active bonuses/penalties per faction.

**FEAT-D008: No Faction Lore Constants**
- **Design Reference:** Section 10.1 mentions `constants/diplomacy.ts`
- **Status:** Not implemented
- **What's Missing:** Extended faction descriptions, leader names, historical context, priorities/grievances.

### Accessibility Gaps

**A11Y-D001: No ARIA Labels on Faction Cards**
- **Severity:** Medium
- **Location:** `DiplomacyPanel.tsx` faction card mapping
- **Issue:** No `aria-label` or `role` attributes on interactive faction cards.
- **Standard:** WCAG 2.1 Level A requires accessible names for interactive elements.

**A11Y-D002: No Keyboard Navigation**
- **Severity:** Medium
- **Location:** `DiplomacyPanel.tsx`
- **Issue:** No `tabIndex`, `onKeyDown` handlers, or focus management.
- **Design Reference:** Section 8.1 specifies "Tab navigation through all interactive elements".

**A11Y-D003: Color-Only Status Indication**
- **Severity:** Medium
- **Location:** `DiplomacyPanel.tsx` lines 20-26 `getRelationStatus()`
- **Issue:** Status is differentiated only by color (green/cyan/yellow/orange/red). No icon or pattern distinction.
- **Standard:** WCAG 2.1 Level A 1.4.1 "Use of Color".
- **Code:**
```typescript
if (relation >= 80) return { text: 'Allied', color: 'text-green-400' };
// Status text exists but could benefit from additional icon
```

**A11Y-D004: Missing Button Disabled Reason**
- **Severity:** Low
- **Location:** `DiplomacyPanel.tsx` line 112
- **Issue:** When "Send Envoy" is disabled due to insufficient denarii, there's no tooltip explaining why.
- **Code:**
```typescript
disabled={!canSendEnvoy}
// Should have aria-describedby or tooltip explaining "Requires 100 denarii"
```

**A11Y-D005: Animation Without Reduced Motion Support**
- **Severity:** Low
- **Location:** `DiplomacyPanel.tsx` framer-motion animations
- **Issue:** Animations do not respect `prefers-reduced-motion` media query.
- **Standard:** WCAG 2.1 Level AAA 2.3.3 "Animation from Interactions".

### Implementation Tasks

| Agent | Task | File(s) | Priority |
|-------|------|---------|----------|
| rome-dev | Create `DiplomacyState` history tracking structure | `/home/clark/romelife/game/src/core/types/index.ts`, `/home/clark/romelife/game/src/store/gameStore.ts` | P1 |
| rome-dev | Add envoy event logging in `executeSendEnvoy()` | `/home/clark/romelife/game/src/app/usecases/index.ts` | P1 |
| rome-dev | Extract faction data to `constants/diplomacy.ts` | `/home/clark/romelife/game/src/core/constants/diplomacy.ts` (new) | P1 |
| rome-design | Create `EnvoyDialog` confirmation component | `/home/clark/romelife/game/src/components/diplomacy/EnvoyDialog.tsx` (new) | P1 |
| rome-design | Add trend badges to faction cards | `/home/clark/romelife/game/src/components/game/DiplomacyPanel.tsx` | P2 |
| rome-design | Implement threshold markers on ProgressBar | `/home/clark/romelife/game/src/components/ui/index.tsx` or new component | P2 |
| rome-design | Create `DiplomaticSummary` overview card | `/home/clark/romelife/game/src/components/diplomacy/DiplomaticSummary.tsx` (new) | P2 |
| rome-design | Add Crisis/Opportunity Alert components | `/home/clark/romelife/game/src/components/game/DiplomacyPanel.tsx` | P2 |
| rome-a11y | Add ARIA labels and roles to faction cards | `/home/clark/romelife/game/src/components/game/DiplomacyPanel.tsx` | P2 |
| rome-a11y | Implement keyboard navigation | `/home/clark/romelife/game/src/components/game/DiplomacyPanel.tsx` | P2 |
| rome-a11y | Add icon differentiation to status badges | `/home/clark/romelife/game/src/components/game/DiplomacyPanel.tsx` | P3 |
| rome-design | Create `FactionDetail` modal with extended lore | `/home/clark/romelife/game/src/components/diplomacy/FactionDetail.tsx` (new) | P3 |
| rome-design | Implement faction sub-tabs | `/home/clark/romelife/game/src/components/game/DiplomacyPanel.tsx` | P3 |
| rome-dev | Add decay projection calculation utility | `/home/clark/romelife/game/src/core/math/index.ts` | P3 |
| rome-a11y | Add reduced motion support to animations | `/home/clark/romelife/game/src/components/game/DiplomacyPanel.tsx` | P4 |

### Data Model Changes Required

**Current `DiplomacyState`:**
```typescript
export interface DiplomacyState {
    relations: Record<string, number>;
    activeEnvoys: number;
}
```

**Proposed `DiplomacyState` (Extended):**
```typescript
export interface DiplomacyState {
    relations: Record<string, number>;
    activeEnvoys: number;
    // New fields for history tracking
    relationHistory: Record<string, RelationHistoryEntry[]>;
    envoyLog: EnvoyLogEntry[];
}

export interface RelationHistoryEntry {
    round: number;
    season: Season;
    value: number;
    change: number;
    cause: 'decay' | 'envoy' | 'event' | 'initial';
    detail?: string;
}

export interface EnvoyLogEntry {
    round: number;
    season: Season;
    factionId: string;
    success: boolean;
    relationChange: number;
}
```

### Test Gaps

- No Playwright tests exist for Diplomacy tab
- No unit tests for `executeSendEnvoy()` use case
- No unit tests for `calculateEnvoySuccess()` or `calculateRelationDecay()`
- Recommend adding test file: `/home/clark/romelife/game/tests/diplomacy.spec.ts`

---

*Audit complete. 2 critical bugs, 6 UI issues, 8 missing features, 5 accessibility gaps identified.*
