# Hexagonal Architecture Folder Flow

This document defines the strict folder structure and dependency rules for the project. The Agent must strictly adhere to this flow to ensure a clean separation of concerns.

## 1. Top-Level Structure

The project is divided into three concentric layers.

```
src/
├── core/           # 1. The Hexagon (Pure Business Logic)
├── app/            # 2. Application Layer (Use Cases)
└── adapters/       # 3. Interface Adapters (UI, Infrastructure)
```

## 2. Layer Definitions & Rules

### 🟢 1. Core (`src/core/`)
**Purpose**: Contains the essential game logic, mathematics, and entity definitions.
**Content**:
-   `math/`: Production formulas, combat math, probability (from [core_math_structure.md](file:///C:/Users/Clark/.gemini/antigravity/brain/d1558092-0211-4fad-87aa-58723b9fab3a/core_math_structure.md)).
-   `entities/`: Territory, Unit, Building, Player definitions.
-   `rules/`: Constants, Configuration, Game Rules.
**⛔ RESTRICTION**: MUST NOT look outside of `core`. No DOM access. No LocalStorage. No UI imports.

### 🟡 2. Application (`src/app/`)
**Purpose**: Orchestrates the game flow using Core entities.
**Content**:
-   `usecases/`: `StartGame`, `EndTurn`, `PurchaseBuilding`, `ResolveBattle`.
-   `ports/`: Interfaces for infrastructure (e.g., `SaveGameRepository`, `AudioService`).
**⛔ RESTRICTION**: Can only import from `core`. Cannot import from `adapters`.

### 🔴 3. Adapters (`src/adapters/`)
**Purpose**: Connects the Application to the outside world (User, Browser).
**Content**:
-   [ui/](file:///c:/Users/Clark/Desktop/Rome.Life/Rome.life_Draft.html#7257-7337):
    -   `components/`: HTML generation, CSS classes (reference [css_tailwind_rules.md](file:///C:/Users/Clark/.gemini/antigravity/brain/d1558092-0211-4fad-87aa-58723b9fab3a/css_tailwind_rules.md)).
    -   `controllers/`: Event listeners that call Application Use Cases.
-   `infra/`:
    -   `storage/`: Implementation of `SaveGameRepository` (LocalStorage).
    -   `browser/`: `window`, `document`, `console` interactions.
**✅ PERMISSION**: Can import from [app](file:///c:/Users/Clark/Desktop/Rome.Life/Rome.life_Draft.html#2408-2490) and `core`.

## 3. Dependency Verification Checklist

The Agent must perform this check before any commit or file creation:

1.  **Check Imports**:
    -   [ ] Does a file in `core/` import something starting with [app/](file:///c:/Users/Clark/Desktop/Rome.Life/Rome.life_Draft.html#2408-2490) or `adapters/`? -> **FAIL**
    -   [ ] Does a file in [app/](file:///c:/Users/Clark/Desktop/Rome.Life/Rome.life_Draft.html#2408-2490) import something starting with `adapters/`? -> **FAIL**
2.  **Check Logic Leakage**:
    -   [ ] Does `core/` contain `document.getElementById` or `window.`? -> **FAIL**
    -   [ ] Does [app/](file:///c:/Users/Clark/Desktop/Rome.Life/Rome.life_Draft.html#2408-2490) contain HTML tags or CSS classes? -> **FAIL**
3.  **Check Boundaries**:
    -   [ ] Are external services (Save/Load) defined as Interfaces in [app/](file:///c:/Users/Clark/Desktop/Rome.Life/Rome.life_Draft.html#2408-2490) and implemented in `adapters/`? -> **PASS**

## 4. Proposed Folder Map

```text
src/
  core/
    constants.js
    math.js          <-- core_math_structure.md logic here
    models/
      Territory.js
      Player.js
  app/
    GameLoop.js
    services/
      MarketService.js
      CombatService.js
  adapters/
    ui/
      render.js
      domEvents.js   <-- Smoke tests interact here
    infra/
      DebugSystem.js <-- smoke_and_backtest.md logic here
      Store.js
```
