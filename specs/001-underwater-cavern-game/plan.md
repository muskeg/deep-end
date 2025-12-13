# Implementation Plan: Underwater Cavern Exploration Game

**Branch**: `001-underwater-cavern-game` | **Date**: 2025-12-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-underwater-cavern-game/spec.md`
**Status**: Phase 8 Complete - Production ready with map redesign and lighting system

## Summary

Action/arcade browser game where players control a diver navigating procedurally generated underwater caverns to collect pearls from clams while managing oxygen-based time limits. Built with Phaser.js game framework for performance-optimized rendering and physics, using Cellular Automata algorithm for organic cavern generation, class-based OOP architecture for entity management, modular code organization supporting incremental delivery of 4 prioritized user stories plus Phase 8 map redesign with realistic lighting system.

**Phase 8 Enhancement**: Deep vertical exploration with fixed 4K width (3840px) and 10x viewport depth, Phaser Light2D pipeline for realistic underwater lighting with sunlight from above and player equipment illumination.

## Technical Context

**Language/Version**: JavaScript ES6+ (target: modern browsers - Chrome 90+, Firefox 88+, Safari 14+)  
**Primary Dependencies**: Phaser.js 3.80+ (game framework with WebGL/Canvas rendering, physics, scene management)  
**Storage**: LocalStorage for high scores and player preferences; no backend/database required  
**Testing**: Jest 29+ for unit tests, Playwright for integration/E2E testing of game states  
**Target Platform**: Web browsers (desktop and mobile), HTML5 Canvas/WebGL rendering  
**Project Type**: Single project (browser-based game with modular frontend architecture)  
**Performance Goals**: 60 FPS consistent framerate, <100ms input latency, <3s load time, smooth rendering for 50+ game objects  
**Constraints**: No external API dependencies, runs entirely client-side, <5MB total asset size, accessible via keyboard controls  
**Scale/Scope**: Single-player game, 4 user stories, 8 entity types, procedural level generation, progressive difficulty system

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Testing Gate**: This project follows Test-Driven Development (TDD). All design artifacts MUST include test specifications that will be written BEFORE implementation.

### Principle Compliance

✅ **Specification-First Development**: Complete spec.md with 4 prioritized user stories exists before planning  
✅ **Agent-Driven Workflow**: Following plan → research → design → tasks flow  
✅ **Template Consistency**: Using standard plan template structure  
✅ **Version Control Integration**: Feature branch `001-underwater-cavern-game` created  
✅ **Structured Documentation**: Plan located in `specs/001-underwater-cavern-game/`  
✅ **TDD Requirement**: Test specifications will be created in Phase 1 design artifacts

**Status**: PASS - All constitutional principles satisfied, proceeding to Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/001-underwater-cavern-game/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output - Phaser.js + Cellular Automata research
├── data-model.md        # Phase 1 output - Entity class definitions
├── quickstart.md        # Phase 1 output - Test scenarios for each user story
├── contracts/           # Phase 1 output - Game state contracts & test interfaces
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
index.html               # Entry point with canvas container
package.json            # Dependencies: phaser, jest, playwright
package-lock.json
.gitignore
README.md

src/
├── main.js             # Phaser game initialization and configuration
├── scenes/             # Phaser scene management
│   ├── BootScene.js    # Asset loading
│   ├── MenuScene.js    # Start menu and UI
│   ├── GameScene.js    # Main gameplay scene
│   └── GameOverScene.js # End game results
├── entities/           # Game object classes (OOP)
│   ├── Player.js       # Player character with movement & collision
│   ├── Clam.js         # Collectible clam entities
│   ├── Pearl.js        # Pearl collectible (contained in clams)
│   ├── Enemy.js        # Hostile sea creature base class
│   ├── Jellyfish.js    # Specific enemy type (extends Enemy)
│   └── Eel.js          # Specific enemy type (extends Enemy)
├── systems/            # Game logic systems
│   ├── CavernGenerator.js    # Cellular Automata level generation
│   ├── CollisionSystem.js    # Collision detection & response
│   ├── OxygenSystem.js       # Oxygen depletion management
│   ├── CurrentSystem.js      # Water current physics
│   └── DifficultySystem.js   # Progressive difficulty scaling
├── utils/              # Helper utilities
│   ├── InputHandler.js       # Keyboard input processing
│   ├── SpriteLoader.js       # Asset management
│   └── Constants.js          # Game constants and configuration
└── ui/                 # UI components
    ├── OxygenMeter.js        # Oxygen display HUD
    ├── ScoreDisplay.js       # Score tracker
    └── LevelIndicator.js     # Current level display

assets/
├── sprites/            # Character and object sprites
│   ├── player/         # Player animation frames
│   ├── enemies/        # Enemy sprites
│   ├── clams/          # Clam open/closed states
│   └── environment/    # Cavern tiles, effects
├── audio/              # Sound effects and music
│   ├── sfx/           # Collection sounds, collision effects
│   └── music/         # Background ambient tracks
└── fonts/             # UI fonts

tests/
├── unit/              # Jest unit tests
│   ├── entities/      # Entity class tests
│   ├── systems/       # System logic tests
│   └── utils/         # Utility function tests
├── integration/       # Playwright integration tests
│   ├── user-story-1.spec.js  # P1: Basic navigation tests
│   ├── user-story-2.spec.js  # P2: Environmental hazards tests
│   ├── user-story-3.spec.js  # P3: Enemy interaction tests
│   └── user-story-4.spec.js  # P4: Procedural generation tests
└── fixtures/          # Test data and mock assets
    └── mockLevels.js  # Predefined test cavern layouts
```

**Structure Decision**: Single project (browser game) with modular architecture. Phaser.js provides scene management while custom entity classes handle game objects. Systems directory contains game logic separate from entities for testability. Tests are organized by user story to support TDD workflow and independent story validation per constitution requirements.

## Complexity Tracking

**No violations** - Project structure follows constitutional principles:
- Single modular codebase (not multiple projects)
- Clear separation of concerns (entities, systems, scenes, UI)
- Test organization matches user story structure for TDD compliance
- Standard browser-based game architecture with industry-standard framework (Phaser.js)
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
