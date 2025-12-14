# Implementation Plan: Roguelike Transformation

**Branch**: `002-rogue-switch` | **Date**: 2025-12-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-rogue-switch/spec.md`

## Summary

Transform Deep End from level-based arcade game to roguelike progression game with permanent upgrades, depth-based difficulty zones, combat mechanics, and visual improvements. Implementation leverages existing Phaser 3.80 architecture while adding LocalStorage persistence, surface shop UI scene, upgrade system, improved enemy AI with pathfinding, harpoon weapon, dash ability, sprite system, physics-based clam spawning, and partially procedural map generation with fixed landmarks. Core loop: dive → collect pearls → surface → buy upgrades → dive deeper.

## Technical Context

**Language/Version**: JavaScript ES6+ (target: modern browsers - Chrome 90+, Firefox 88+, Safari 14+)  
**Primary Dependencies**: Phaser.js 3.80+ (existing), no new external dependencies required  
**Storage**: Browser LocalStorage API for persistent progression data (upgrade levels, pearl currency, statistics)  
**Testing**: Jest 29+ for unit tests (existing), Playwright for E2E tests (existing), manual testing for roguelike loop  
**Target Platform**: Web browsers (desktop and mobile), HTML5 Canvas/WebGL rendering with Phaser Light2D pipeline  
**Project Type**: Single project (browser-based game) - extending existing modular architecture  
**Performance Goals**: Maintain 60 FPS, LocalStorage operations <10ms, sprite rendering with lighting system  
**Constraints**: No backend, static files only (GitHub Pages compatible), LocalStorage 5-10MB limit, keyboard controls  
**Scale/Scope**: 6 user stories, ~15 new entity/system classes, 6 upgrade types, 3 depth zones, sprite atlas system

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Testing Gate**: This project follows Test-Driven Development (TDD). All design artifacts MUST include test specifications that will be written BEFORE implementation.

### Principle Compliance

✅ **Specification-First Development**: Complete spec.md with 6 prioritized user stories exists before planning  
✅ **Agent-Driven Workflow**: Following plan → research → design → tasks flow  
✅ **Template Consistency**: Using standard plan template structure  
✅ **Version Control Integration**: Feature branch `002-rogue-switch` created  
✅ **Structured Documentation**: Plan located in `specs/002-rogue-switch/`  
✅ **TDD Requirement**: Test specifications will be created in Phase 1 design artifacts  
✅ **Iterative Delivery**: User stories prioritized P1-P6 for incremental implementation

**Status**: PASS - All constitutional principles satisfied, proceeding to Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/002-rogue-switch/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output - LocalStorage patterns, sprite systems, pathfinding
├── data-model.md        # Phase 1 output - Upgrade, DepthZone, Harpoon, Dash entities
├── quickstart.md        # Phase 1 output - Test scenarios for each user story
└── contracts/           # Phase 1 output - Shop UI, progression save/load, combat contracts
```

### Source Code (extending existing structure)

```text
src/
├── scenes/              # Phaser scene management
│   ├── BootScene.js          # Existing - asset loading
│   ├── MenuScene.js          # Existing - start menu
│   ├── ShopScene.js          # NEW - surface shop for upgrades
│   ├── GameScene.js          # MODIFIED - add depth zones, combat, run management
│   └── GameOverScene.js      # MODIFIED - show pearl total, return to shop
├── entities/            # Game objects extending Phaser.Sprite
│   ├── Player.js             # MODIFIED - add dash ability, harpoon firing
│   ├── Enemy.js              # MODIFIED - pathfinding, chase abandonment, health
│   ├── Clam.js               # MODIFIED - physics-based spawning, sprite animation
│   ├── Pearl.js              # MODIFIED - three value tiers
│   ├── Harpoon.js            # NEW - projectile weapon entity
│   └── Wall.js               # Existing - solid obstacles
├── systems/             # Core game logic (non-entity)
│   ├── CollisionSystem.js    # Existing - physics collision handling
│   ├── OxygenSystem.js       # MODIFIED - scale by upgrade level
│   ├── CurrentSystem.js      # Existing - water current physics
│   ├── DifficultySystem.js   # MODIFIED - zone-based scaling instead of level
│   ├── UpgradeSystem.js      # NEW - manage owned upgrades, apply effects
│   ├── ProgressionSystem.js  # NEW - LocalStorage save/load, pearl tracking
│   ├── DepthZoneSystem.js    # NEW - manage zone boundaries, transitions
│   ├── PathfindingSystem.js  # NEW - A* navigation for enemies
│   └── CombatSystem.js       # NEW - damage application, enemy health
├── ui/                  # UI components
│   ├── OxygenMeter.js        # Existing - oxygen display
│   ├── ScoreDisplay.js       # MODIFIED - show pearl count instead of score
│   ├── LevelIndicator.js     # MODIFIED - show depth in meters
│   ├── DepthMeter.js         # NEW - depth display with zone indicators
│   ├── DashCooldown.js       # NEW - visual cooldown indicator
│   └── ShopMenu.js           # NEW - upgrade purchase UI
├── utils/               # Helper utilities
│   ├── InputHandler.js       # MODIFIED - add attack (Q) and dash (Shift) keys
│   ├── SpriteLoader.js       # MODIFIED - load sprite atlases
│   ├── Constants.js          # MODIFIED - add upgrade costs, zone depths, combat values
│   └── LocalStorageManager.js # NEW - save/load helper with validation
└── data/                # NEW - configuration data
    ├── upgrades.json         # Upgrade definitions (types, costs, effects)
    ├── zones.json            # Depth zone configurations
    └── landmarks.json        # Fixed landmark definitions for map

assets/
├── sprites/             # NEW - sprite atlas system
│   ├── diver/               # Player sprite sheets (idle, swim, dash)
│   ├── enemies/             # Enemy sprite sheets per zone type
│   ├── clams/               # Clam sprites (closed, opening, open)
│   ├── harpoon/             # Harpoon projectile sprite
│   └── ui/                  # UI element sprites
└── atlas/               # NEW - generated texture atlases
    └── game-atlas.json      # Phaser texture atlas definition

tests/
├── unit/                # Jest unit tests
│   ├── systems/
│   │   ├── UpgradeSystem.test.js       # NEW - upgrade application logic
│   │   ├── ProgressionSystem.test.js   # NEW - save/load functionality
│   │   ├── DepthZoneSystem.test.js     # NEW - zone boundary detection
│   │   ├── PathfindingSystem.test.js   # NEW - A* navigation
│   │   └── CombatSystem.test.js        # NEW - damage calculation
│   └── entities/
│       ├── Harpoon.test.js             # NEW - projectile behavior
│       └── Enemy.test.js               # MODIFIED - pathfinding, chase logic
└── integration/         # Playwright E2E tests
    ├── shop-upgrade-flow.spec.js       # NEW - P1: buy upgrade, verify effect
    ├── depth-zones.spec.js             # NEW - P2: traverse zones, verify difficulty
    ├── combat-system.spec.js           # NEW - P3: harpoon/dash usage
    ├── sprite-rendering.spec.js        # NEW - P4: verify sprite display
    ├── clam-physics.spec.js            # NEW - P5: clam falling behavior
    └── map-landmarks.spec.js           # NEW - P6: landmark consistency
```

**Structure Decision**: Extends existing Phaser architecture with new systems and entities. Maintains separation of concerns (entities vs. systems). LocalStorage operations isolated in dedicated manager. Sprite system replaces direct graphics rendering. No backend changes required - purely client-side static files.

## Complexity Tracking

**Justified Complexity**:
- **PathfindingSystem**: Required for proper enemy navigation (FR-029, FR-030). A* algorithm necessary to compute valid paths around walls. Alternative (simple chase) violates user requirement to fix wall-phasing.
- **Sprite Atlas System**: Required for professional visuals (FR-034-039). Texture atlases improve rendering performance and memory usage vs. individual image files. Standard game dev practice.
- **DepthZoneSystem**: Required for zone-based difficulty scaling (FR-014-020). Centralizes zone logic instead of scattering conditionals across codebase. Simplifies adding future zones.
- **ProgressionSystem + LocalStorage**: Required for persistent roguelike progression (FR-003, FR-004). LocalStorage API necessary to meet "no backend" constraint. Alternative (cookies) inferior for structured data.

**No Violations** - All complexity directly maps to functional requirements. No premature abstractions or speculative patterns.
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
