# Implementation Plan: Roguelike Transformation

**Branch**: `002-rogue-switch` | **Date**: 2025-12-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-rogue-switch/spec.md`

## Summary

Transform Deep End from level-based arcade game to roguelike progression game with permanent upgrades, depth-based difficulty zones, combat mechanics, and visual improvements. Implementation leverages existing Phaser 3.80 architecture while adding LocalStorage persistence, surface shop UI scene, upgrade system, improved enemy AI with pathfinding, harpoon weapon, dash ability, procedural sprite generation, physics-based clam spawning, and chunk-based procedural world generation with seeded cellular automata. A unified input system supports keyboard, gamepad, and touch controls. Core loop: dive → collect pearls → surface → buy upgrades → dive deeper.

## Technical Context

**Language/Version**: JavaScript ES6+ (target: modern browsers - Chrome 90+, Firefox 88+, Safari 14+)  
**Primary Dependencies**: Phaser.js 3.80+ (existing), no new external dependencies required  
**Storage**: Browser LocalStorage API for persistent progression data (upgrade levels, pearl currency, statistics)  
**Testing**: Jest 29+ for unit tests (existing), Playwright for E2E tests (existing), manual testing for roguelike loop  
**Target Platform**: Web browsers (desktop and mobile), HTML5 Canvas/WebGL rendering with Phaser Light2D pipeline  
**Project Type**: Single project (browser-based game) - extending existing modular architecture  
**Performance Goals**: Maintain 60 FPS, LocalStorage operations <10ms, sprite rendering with lighting system  
**Constraints**: No backend, static files only (GitHub Pages compatible), LocalStorage 5-10MB limit, keyboard/gamepad/touch controls  
**Scale/Scope**: 6 user stories, ~15 new entity/system classes, 6 upgrade types, 3 depth zones, procedural sprite generation, chunk-based world (10000px chunks with seam blending)

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
│   ├── GameScene.js          # MODIFIED - chunk-based world generation, unified input, depth zones, combat, run management
│   └── GameOverScene.js      # MODIFIED - show pearl total, return to shop
├── entities/            # Game objects extending Phaser.Sprite
│   ├── Player.js             # MODIFIED - sprite-based rendering, 8-dir animation, dash ability, harpoon firing, movement vector input
│   ├── Enemy.js              # MODIFIED - sprite-based rendering (no more graphics/circles), texture param in constructor, pathfinding, chase abandonment, health
│   ├── Jellyfish.js          # MODIFIED - sprite-based with pulsing animation, removed dead updateVisuals()
│   ├── Eel.js                # MODIFIED - sprite-based with serpentine animation, chase timer, pathfinding in chasing state
│   ├── Clam.js               # MODIFIED - physics-based spawning, sprite animation
│   ├── Pearl.js              # MODIFIED - three value tiers
│   ├── Harpoon.js            # NEW - projectile weapon entity
│   ├── Wall.js               # MODIFIED - per-channel color addition with clamping for edge highlights
│   └── WaterCurrent.js       # Existing - water current entity
├── systems/             # Core game logic (non-entity)
│   ├── CavernGenerator.js    # MODIFIED - options system (hasSurface/hasBottom/topOverlapRow), seam blending, re-enabled connectivity validation
│   ├── CollisionSystem.js    # MODIFIED - uses player.isInvulnerable instead of separate timer, removed vestigial lastEnemyCollisionTime
│   ├── CombatSystem.js       # NEW - damage application, enemy death effects, pearl spawning on kill
│   ├── CurrentSystem.js      # MODIFIED - additive force (+=) instead of replacement (=)
│   ├── DepthZoneSystem.js    # NEW - zone boundaries, ambient lighting transitions, corrected lerp formula
│   ├── DifficultySystem.js   # MODIFIED - resolves zone object before requesting multipliers
│   ├── InputSystem.js        # NEW - unified keyboard/gamepad/touch input with normalized movement vector
│   ├── OxygenSystem.js       # MODIFIED - direct oxygen depletion via system rate, routes damage through player.takeDamage(), dynamic warningThreshold
│   ├── PathfindingSystem.js  # NEW - A* navigation for enemies
│   ├── ProgressionSystem.js  # MODIFIED - singleton pattern with clearInstance() for testing
│   └── UpgradeSystem.js      # NEW - manage owned upgrades, apply effects
├── ui/                  # UI components
│   ├── OxygenMeter.js        # Existing - oxygen display
│   ├── ScoreDisplay.js       # Existing - score display
│   ├── DepthMeter.js         # NEW - depth display with zone name
│   ├── DashCooldown.js       # NEW - visual cooldown indicator
│   ├── FPSDisplay.js         # NEW - debug FPS counter
│   └── ShopMenu.js           # NEW - upgrade purchase UI
├── utils/               # Helper utilities
│   ├── AudioManager.js       # Existing - audio management
│   ├── InputHandler.js       # MODIFIED - E key for interact (was SPACE), removed onAttack (moved to InputSystem), cleanup uses keydown-E
│   ├── SpriteGenerator.js    # NEW - procedural sprite textures (diver 8-dir, jellyfish pulse, eel serpentine) via Canvas 2D API
│   ├── Constants.js          # MODIFIED - add upgrade costs, zone depths, combat values, enemy config
│   ├── LocalStorageManager.js # NEW - save/load helper with validation
│   └── ScoreManager.js       # Existing - score utilities
└── data/                # Configuration data
    ├── upgrades.json         # Upgrade definitions (types, costs, effects)
    ├── zones.json            # MODIFIED - ambient colors as numbers (not hex strings), corrected Midnight Zone maxDepth (2000)
    └── landmarks.json        # Fixed landmark definitions for map

tests/
├── unit/                # Jest unit tests
│   ├── systems/
│   │   ├── CavernGenerator.test.js   # Existing - chunk generation, validation
│   │   ├── CollisionSystem.test.js   # Existing - collision detection
│   │   ├── CurrentSystem.test.js     # Existing - current forces
│   │   ├── DifficultySystem.test.js  # Existing - difficulty scaling
│   │   ├── OxygenSystem.test.js      # MODIFIED - updated for direct depletion, takeDamage routing, maxOxygen mock
│   │   ├── DepthZoneSystem.test.js   # NEW - zone boundary detection
│   │   ├── PathfindingSystem.test.js # NEW - A* navigation
│   │   └── CombatSystem.test.js      # NEW - damage calculation
│   └── entities/
│       ├── Player.test.js            # Existing - player behavior
│       ├── Enemy.test.js             # Existing - enemy AI
│       ├── Jellyfish.test.js         # Existing - jellyfish patrol/chase
│       ├── Eel.test.js               # Existing - eel chase/lunge
│       ├── Clam.test.js              # Existing - clam interaction
│       ├── Pearl.test.js             # Existing - pearl collection
│       ├── WaterCurrent.test.js      # Existing - current behavior
│       ├── Harpoon.test.js           # NEW - projectile behavior
│       └── InputHandler.test.js      # Existing - input handling
├── integration/         # Integration tests
│   └── user-story-1.spec.js          # Existing - upgrade flow
└── e2e/                 # Playwright E2E tests
    └── user-story-3.spec.js          # Existing - combat E2E
```

**Structure Decision**: Extends existing Phaser architecture with new systems and entities. Maintains separation of concerns (entities vs. systems). LocalStorage operations isolated in dedicated manager. Sprite system uses procedural generation via Canvas 2D API (SpriteGenerator) — no external asset files needed for entity visuals. Gamepad plugin enabled in Phaser config. No backend changes required — purely client-side static files.

## Complexity Tracking

**Justified Complexity**:
- **PathfindingSystem**: Required for proper enemy navigation (FR-029, FR-030). A* algorithm necessary to compute valid paths around walls. Alternative (simple chase) violates user requirement to fix wall-phasing.
- **SpriteGenerator (Procedural Sprites)**: Required for visual identity (FR-034-039). Generates pixel-art textures at runtime via Canvas 2D API — no external asset pipeline needed. Simpler than loading sprite sheets and eliminates asset management overhead.
- **Chunk-Based World Generation**: Required for seamless infinite-depth exploration (FR-043, FR-044, FR-046a-c). Chunks are generated on demand with seeded cellular automata, cached, and loaded/unloaded around the player. Cross-chunk seam blending (last row → next chunk's first row) ensures continuity. Alternative (single monolithic grid) would exceed memory limits for deep worlds.
- **DepthZoneSystem**: Required for zone-based difficulty scaling (FR-014-020). Centralizes zone logic instead of scattering conditionals across codebase. Simplifies adding future zones.
- **ProgressionSystem + LocalStorage**: Required for persistent roguelike progression (FR-003, FR-004). LocalStorage API necessary to meet "no backend" constraint. Singleton pattern ensures shared state across scenes. Alternative (cookies) inferior for structured data.
- **InputSystem (Unified Input)**: Required for cross-device support (FR-051-053). Consolidates keyboard, gamepad, and touch into one normalized interface. Alternative (separate handlers per device) duplicates logic and creates inconsistencies.

**No Violations** — All complexity directly maps to functional requirements. No premature abstractions or speculative patterns.
