# Hexagonal Architecture Folder Flow

I will create a document `folder_flow.md` that defines the target folder structure for the project, enforcing a Hexagonal (Ports and Adapters) Architecture. This will serve as a blueprint for refactoring the current monolithic HTML file.

## User Review Required
None.

## Proposed Changes
I will create a new artifact `C:\Users\Clark\.gemini\antigravity\brain\d1558092-0211-4fad-87aa-58723b9fab3a\folder_flow.md`.

### Content Overview
1.  **Core Domain (`/core`)**:
    -   Pure game logic (Math, Entities, Rules).
    -   *Rule*: No dependencies on UI or Infrastructure.
    -   *Check*: Imports must only be from `/core`.
2.  **Application Layer (`/app`)**:
    -   Use cases and game flow (Turn management, Event handling).
    -   *Rule*: Depends only on `/core`.
3.  **Adapters (`/adapters`)**:
    -   **Infrastructure (`/adapters/infra`)**: Save/Load (LocalStorage), Sound, Analytics.
    -   **UI (`/adapters/ui`)**: DOM manipulation, Rendering, Event Listeners.
    -   *Rule*: Can depend on `/app` and `/core`.
4.  **Verification Script**:
    -   I will include a pseudo-code or shell script representation of how an agent can "check" this structure (e.g., ensuring no circular dependencies or forbidden imports).

### Planned Structure
```
src/
├── core/           # The "Hexagon" (Business Logic)
│   ├── math/       # Formulas from core_math_structure.md
│   ├── entities/   # Territory, Unit, Building definitions
│   └── rules/      # Game rules and constants
├── app/            # Application Services
│   └── usecases/   # StartGame, EndTurn, ProcessTrade
└── adapters/       # The "Adapters"
    ├── ui/         # HTML/CSS/DOM (Presentation)
    └── infra/      # Browser APIs (Storage, Network)
```

## Verification Plan
### Manual Verification
- Review the `folder_flow.md` to ensure the separation of concerns is clear and the dependency rules are strict.
