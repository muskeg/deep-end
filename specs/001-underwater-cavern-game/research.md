# Research: Underwater Cavern Exploration Game

**Date**: 2025-12-12  
**Purpose**: Technical research for implementation decisions

## Research Topics

### 1. Phaser.js Game Framework

**Decision**: Use Phaser.js 3.80+ as game framework

**Rationale**:
- **Performance**: Hardware-accelerated WebGL rendering with automatic Canvas fallback achieves 60 FPS target
- **Built-in Systems**: Physics engine, collision detection, sprite management, scene system reduces custom code
- **Active Development**: Large community, regular updates, extensive documentation and examples
- **Class-based Architecture**: Natural fit for OOP entity design (Player, Enemy, Clam classes)
- **Input Handling**: Robust keyboard input system with key state tracking
- **Asset Pipeline**: Built-in loader and cache system for sprites, audio, fonts

**Alternatives Considered**:
- **Vanilla Canvas API**: Rejected - requires building physics, collision, scene management from scratch; development time exceeds benefits
- **PixiJS**: Rejected - excellent renderer but lacks game-specific features (physics, input, scenes); would need additional libraries
- **Kaboom.js**: Rejected - simpler API but less performant for complex procedural generation and multiple entities

**Implementation Notes**:
- Use Phaser.Scene for game states (Boot, Menu, Game, GameOver)
- Leverage Phaser.Physics.Arcade for collision detection (lightweight, sufficient for 2D game)
- Extend Phaser.GameObjects.Sprite for entity classes
- Use Phaser.Tilemaps for cavern rendering (generated from Cellular Automata)

---

### 2. Cellular Automata for Cavern Generation

**Decision**: Implement Cellular Automata algorithm for procedural cavern generation

**Rationale**:
- **Organic Appearance**: Creates natural, cave-like structures that feel authentic for underwater caverns
- **Controllable**: Tunable parameters (birth/death thresholds, iterations) control complexity and openness
- **Performant**: Runs in O(n) time where n = grid cells; generates 100x100 grid in <50ms
- **Guaranteed Connectivity**: Flood-fill validation ensures all areas reachable, satisfying FR-016 and FR-017
- **Progressive Difficulty**: Easy to scale complexity by adjusting initial density, iterations, room count

**Algorithm Overview**:
1. Initialize 2D grid with random density (e.g., 45% walls, 55% open water)
2. Apply cellular automata rules for N iterations:
   - Cell becomes wall if ≥5 neighbors are walls (birth rule)
   - Cell becomes open if ≤3 neighbors are walls (death rule)
3. Flood-fill from random open cell to find largest connected region
4. Remove disconnected areas (ensures accessibility)
5. Place clams in open areas with minimum spacing
6. Identify suitable patrol paths for enemies
7. Validate all pearls reachable from start position

**Alternatives Considered**:
- **BSP (Binary Space Partitioning)**: Rejected - creates rectangular rooms; doesn't match organic underwater aesthetic
- **Drunkard's Walk**: Rejected - creates narrow winding tunnels; difficult to ensure balanced level difficulty
- **Predefined Templates**: Rejected - reduces replayability; doesn't satisfy P4 procedural generation requirement

**Implementation Notes**:
- Grid size: 100x100 cells for performance (scales to 200x200 for harder levels)
- Tile size: 32x32 pixels for sprite clarity
- Store as Phaser.Tilemap for efficient rendering
- Cache generated levels for potential level select/replay feature

---

### 3. Class-Based OOP Entity Architecture

**Decision**: Use ES6 classes extending Phaser sprites for all game entities

**Rationale**:
- **Inheritance**: Base Entity class → Player, Enemy subtypes (Jellyfish, Eel) share common behavior
- **Encapsulation**: Each entity manages its own state, update logic, collision responses
- **Testability**: Classes can be unit tested independently with mocked Phaser dependencies
- **Phaser Integration**: Extends Phaser.GameObjects.Sprite, inherits rendering and physics properties
- **Maintainability**: Clear separation of entity logic from scene/system logic

**Entity Hierarchy**:
```
Phaser.GameObjects.Sprite
├── Player (extends Sprite)
│   - Properties: oxygenLevel, score, speed, controls
│   - Methods: move(), collectPearl(), takeDamage(), updateOxygen()
├── Collectible (extends Sprite)
│   ├── Clam
│   │   - Properties: isOpen, pearl, interactionRadius
│   │   - Methods: open(), givePearl()
│   └── Pearl
│       - Properties: value, sparkleEffect
│       - Methods: collect()
└── Enemy (extends Sprite)
    ├── Jellyfish (patrol behavior)
    │   - Properties: patrolPath, speed, detectionRadius
    │   - Methods: patrol(), chase(), attack()
    └── Eel (chase behavior)
        - Properties: aggroRange, speed, attackCooldown
        - Methods: detect(), pursue(), strike()
```

**Alternatives Considered**:
- **ECS (Entity Component System)**: Rejected - overengineered for 8 entity types; adds complexity without performance benefit for this scale
- **Prototype Pattern**: Rejected - ES6 classes provide clearer syntax and better tooling support
- **Functional Composition**: Rejected - doesn't align with Phaser's class-based architecture; creates friction

**Implementation Notes**:
- All entities have update(delta) method called each frame
- Use Phaser.Physics.Arcade.Body for collision boundaries
- Implement pooling for clams/pearls to reduce garbage collection
- Use Phaser.Animations for sprite animation states

---

### 4. Performance Optimization Strategies

**Decision**: Implement performance optimizations from project start to achieve 60 FPS goal

**Optimization Techniques**:

**Rendering Optimization**:
- Use Phaser's WebGL renderer (falls back to Canvas if unsupported)
- Implement camera culling (only render visible entities)
- Use sprite atlases to minimize draw calls
- Limit particle effects to 50 concurrent particles
- Static tilemap caching (cavern doesn't change mid-level)

**Collision Detection Optimization**:
- Phaser Arcade Physics spatial hash (O(n) vs O(n²) naive approach)
- Enable only necessary collisions (Player ↔ Walls, Player ↔ Enemies, Player ↔ Clams)
- Disable physics for static objects (walls, collected clams)
- Use collision callbacks instead of per-frame overlap checks

**Entity Management**:
- Object pooling for frequently created/destroyed objects (pearls, particles)
- Lazy enemy activation (only update enemies within 2 screen widths of player)
- Cap maximum entities: 50 clams, 20 enemies, 100 particles per level

**Memory Management**:
- Destroy unused assets between scenes
- Compress sprites (PNG → WebP for supported browsers, fallback to PNG)
- Lazy load audio (load on first play, cache in memory)
- Clear level data on scene transition

**Profiling Targets**:
- Target: 60 FPS (16.67ms per frame)
- Budget per frame: Render 8ms, Update 6ms, Physics 2ms, Overhead 0.67ms
- Monitor with Phaser's built-in FPS counter
- Use Chrome DevTools Performance profiler to identify bottlenecks

**Alternatives Considered**:
- **Deferred Optimization**: Rejected - conflicts with "Performance optimization" priority; early optimization prevents technical debt
- **Web Workers for Generation**: Rejected - adds complexity; Cellular Automata is fast enough on main thread (<50ms)

**Implementation Notes**:
- Enable Phaser debug mode only in development
- Use requestAnimationFrame (Phaser default) for smooth frame pacing
- Implement simple LOD (Level of Detail) for distant enemies (reduce animation frame rate)
- Monitor memory usage via Performance API

---

### 5. Testing Strategy (TDD Compliance)

**Decision**: Jest for unit tests, Playwright for integration/E2E tests

**Testing Architecture**:

**Unit Tests (Jest)**:
- Test entity classes in isolation (Player movement, Clam interaction, Enemy AI)
- Test systems independently (CavernGenerator output validation, OxygenSystem depletion rate)
- Mock Phaser dependencies (scenes, physics, input)
- Target: 80%+ code coverage for business logic

**Integration Tests (Playwright)**:
- Test complete user stories (P1 through P4)
- Automated browser testing with real Phaser game instance
- Validate game states, UI updates, win/loss conditions
- Performance assertions (FPS monitoring, load time verification)

**Test Organization (per User Story)**:
```
tests/unit/
├── entities/
│   ├── Player.test.js           # [US1] Movement, oxygen, collection
│   ├── Clam.test.js             # [US1] Open/close, pearl dispensing
│   ├── Enemy.test.js            # [US3] Base enemy behavior
│   └── Jellyfish.test.js        # [US3] Patrol AI
├── systems/
│   ├── OxygenSystem.test.js     # [US1] Depletion rate, game over trigger
│   ├── CollisionSystem.test.js  # [US1, US2, US3] All collision types
│   ├── CurrentSystem.test.js    # [US2] Water current physics
│   └── CavernGenerator.test.js  # [US4] Level generation validation
└── utils/
    └── InputHandler.test.js     # [US1] Keyboard input processing

tests/integration/
├── user-story-1.spec.js  # Complete level, collect pearls, oxygen depletes
├── user-story-2.spec.js  # Navigate hazards, currents affect movement
├── user-story-3.spec.js  # Evade enemies, collision causes oxygen loss
└── user-story-4.spec.js  # Multiple levels generate, difficulty increases
```

**TDD Workflow**:
1. Write failing test for user story acceptance criteria
2. Implement minimum code to pass test
3. Refactor while keeping tests green
4. Repeat for next acceptance scenario

**Alternatives Considered**:
- **Mocha + Chai**: Rejected - Jest has better Phaser mocking support and built-in coverage
- **Cypress**: Rejected - Playwright has better performance and modern API
- **Manual Testing Only**: Rejected - violates constitution TDD requirement

**Implementation Notes**:
- Use Jest's `jest.mock()` for Phaser module mocking
- Create test fixtures for predefined cavern layouts (deterministic testing)
- Playwright headless mode for CI/CD integration
- Tag tests with user story IDs for traceability

---

## Summary

All technical decisions resolved:
- ✅ Framework: Phaser.js 3.80+ for performance and game features
- ✅ Generation: Cellular Automata for organic cavern aesthetics
- ✅ Architecture: Class-based OOP with ES6 classes extending Phaser sprites
- ✅ Performance: Early optimization strategies targeting 60 FPS
- ✅ Testing: Jest + Playwright with TDD workflow per constitution

**Ready for Phase 1**: Data model and contracts can now be generated with concrete technical foundation.
