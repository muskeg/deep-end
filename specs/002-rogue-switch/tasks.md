# Tasks: Roguelike Transformation - Deep End

**Input**: Design documents from `/specs/002-rogue-switch/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Test tasks are OPTIONAL for this feature - focus on implementation first, add tests if time allows.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and data configuration files

- [X] T001 Create data configuration directory structure (`src/data/`)
- [X] T002 [P] Create `src/data/upgrades.json` with 6 upgrade type definitions (oxygen, light, speed, harpoon, dash, sonar) including baseCost, effects, and descriptions
- [X] T003 [P] Create `src/data/zones.json` with 3 depth zone configs (Sunlight 0-500m, Twilight 500-1500m, Midnight 1500m+) including ambient colors, spawn rates, pearl values
- [X] T004 [P] Create `src/data/landmarks.json` with landmark region definitions (surface plateau, deep trench, etc.)
- [X] T005 [P] Update `src/utils/Constants.js` with combat values (harpoon damage, dash cooldown, enemy health), zone depths, upgrade multipliers

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core systems that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create `src/utils/LocalStorageManager.js` with save(), load(), validate() methods for versioned JSON data
- [X] T007 Create `src/systems/ProgressionSystem.js` class extending LocalStorageManager with addPearls(), getPearls(), purchaseUpgrade(), getUpgradeLevel() methods
- [X] T008 Create `src/systems/UpgradeSystem.js` class with applyUpgrades(player), getUpgradeEffect(type, level) methods using data from upgrades.json
- [X] T009 Update `src/entities/Player.js` to accept upgrade parameters in constructor (oxygenMultiplier, lightMultiplier, speedMultiplier)
- [X] T010 Update `src/utils/InputHandler.js` to add ESC key (surface voluntarily), Q key (fire harpoon), Shift key (activate dash)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Permanent Upgrade Progression (Priority: P1) 🎯 MVP

**Goal**: Establish core roguelike loop (dive → collect pearls → surface → purchase upgrades → dive with upgrades applied)

**Independent Test**: Collect pearls in dive, surface voluntarily (ESC), purchase upgrade in shop, start new dive, verify upgrade is active. Refresh browser and verify progress persists.

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create `src/scenes/ShopScene.js` class extending Phaser.Scene with create(), showUpgradeList(), onUpgradeClick(), onStartDiveClick() methods
- [ ] T012 [P] [US1] Create `src/ui/ShopMenu.js` class with renderUpgradeList(upgrades), renderPearlBalance(), createPurchaseButton(upgrade) methods
- [ ] T013 [US1] In ShopScene.create(), initialize ProgressionSystem, load pearl balance, load owned upgrades from LocalStorage
- [ ] T014 [US1] In ShopScene.showUpgradeList(), render all 6 upgrade types with current level, next cost (baseCost * 1.5^level), and locked/unlocked state
- [ ] T015 [US1] In ShopScene.onUpgradeClick(), validate pearl balance, call ProgressionSystem.purchaseUpgrade(), deduct cost, save to LocalStorage, refresh UI
- [ ] T016 [US1] In ShopScene.onStartDiveClick(), load owned upgrades, transition to GameScene with upgrade parameters passed via scene data
- [ ] T017 [US1] Update `src/scenes/GameScene.js` init(data) to receive upgrade parameters and pass to Player constructor
- [ ] T018 [US1] Update `src/systems/OxygenSystem.js` to scale max oxygen by player.oxygenMultiplier (from upgrades)
- [ ] T019 [US1] Update `src/entities/Player.js` light setup to scale light radius by player.lightMultiplier (from upgrades)
- [ ] T020 [US1] Update `src/entities/Player.js` movement to scale speed by player.speedMultiplier (from upgrades)
- [ ] T021 [US1] Update `src/entities/Pearl.js` to add collected pearls to ProgressionSystem instead of score
- [ ] T022 [US1] Update `src/scenes/GameOverScene.js` to show "Return to Shop" button that transitions to ShopScene (preserving pearl balance)
- [ ] T023 [US1] In GameScene, add ESC key handler that ends run voluntarily and transitions to ShopScene
- [ ] T024 [US1] Add save() call in ProgressionSystem after each pearl collection and upgrade purchase
- [ ] T025 [US1] Update `src/scenes/MenuScene.js` to check LocalStorage on start, show "Continue" button if save data exists, "New Game" to reset

**Checkpoint**: User Story 1 complete - Core roguelike loop functional with persistent upgrades

---

## Phase 4: User Story 2 - Depth-Based Difficulty Zones (Priority: P2)

**Goal**: Three distinct depth zones with scaled difficulty, lighting changes, and pearl value tiers

**Independent Test**: Dive through all three zones (0-500m, 500-1500m, 1500m+), observe lighting transitions, enemy difficulty increases, and pearl values scaling (1/5/20).

### Implementation for User Story 2

- [ ] T026 [P] [US2] Create `src/systems/DepthZoneSystem.js` class with getCurrentZone(depth), updateAmbientLight(depth, lightsManager), getEnemyMultipliers(zone), getPearlValue(zone) methods
- [ ] T027 [P] [US2] Create `src/ui/DepthMeter.js` class with updateDepth(meters), displayZoneName(zone) methods
- [ ] T028 [US2] In DepthZoneSystem, load zones.json and store zone configs (Sunlight, Twilight, Midnight)
- [ ] T029 [US2] In DepthZoneSystem.getCurrentZone(), compare player depth to zone boundaries (500m, 1500m) and return matching zone object
- [ ] T030 [US2] In DepthZoneSystem.updateAmbientLight(), lerp ambient light color over 100px transition at zone boundaries
- [ ] T031 [US2] In GameScene.update(), call DepthZoneSystem.getCurrentZone(player.y) and DepthZoneSystem.updateAmbientLight(player.y, this.lights)
- [ ] T032 [US2] Update `src/systems/DifficultySystem.js` to call DepthZoneSystem.getEnemyMultipliers(currentZone) and scale enemy speed/damage accordingly
- [ ] T033 [US2] Update `src/entities/Enemy.js` to accept speed and damage multipliers in constructor
- [ ] T034 [US2] Update `src/entities/Pearl.js` to accept value parameter (1/5/20) based on zone when spawned
- [ ] T035 [US2] In GameScene enemy spawning, use DifficultySystem to get zone-scaled spawn rate and enemy stats
- [ ] T036 [US2] In GameScene clam spawning, use DepthZoneSystem.getPearlValue(zone) to set pearl value tier
- [ ] T037 [US2] Add DepthMeter UI to GameScene showing current depth in meters and zone name (e.g., "Depth: 847m - Twilight Zone")
- [ ] T038 [US2] Add visual/audio feedback when crossing zone boundary (screen flash, sound effect)

**Checkpoint**: User Story 2 complete - Depth zones create meaningful difficulty progression and risk/reward

---

## Phase 5: User Story 3 - Combat & Enemy AI Improvements (Priority: P3)

**Goal**: Add harpoon weapon, dash ability, enemy pathfinding, and improved chase AI

**Independent Test**: Fire harpoon at enemy to deal damage/kill it, use dash to escape, observe enemies navigating around walls and abandoning chase at distance.

### Implementation for User Story 3

- [ ] T039 [P] [US3] Create `src/entities/Harpoon.js` class extending Phaser.Physics.Arcade.Sprite with fire(x, y, directionX, directionY), onEnemyCollision(enemy) methods
- [ ] T040 [P] [US3] Create `src/systems/PathfindingSystem.js` class with findPath(startX, startY, targetX, targetY, grid), manhattanDistance(x1, y1, x2, y2), buildGrid(walls) methods
- [ ] T041 [P] [US3] Create `src/systems/CombatSystem.js` class with dealDamage(entity, amount), onEnemyKilled(enemy) methods
- [ ] T042 [P] [US3] Create `src/ui/DashCooldown.js` class with startCooldown(duration), update(deltaTime), canActivate() methods
- [ ] T043 [US3] In Player.js, add dashAbility property with cooldown timer, boostMultiplier (2.5x), duration (0.5s)
- [ ] T044 [US3] In Player.js, add activateDash() method that multiplies speed, starts visual effect, begins cooldown
- [ ] T045 [US3] In InputHandler, on Shift key press, call player.activateDash() if cooldown ready
- [ ] T046 [US3] In Player.js, add fireHarpoon() method that spawns Harpoon entity in facing direction
- [ ] T047 [US3] In InputHandler, on Q key press, call player.fireHarpoon()
- [ ] T048 [US3] In Harpoon.fire(), set velocity (400px/s), start max range timer (600px), add self-destruct after range
- [ ] T049 [US3] In GameScene, add arcade physics overlap between harpoon group and enemy group
- [ ] T050 [US3] In Harpoon.onEnemyCollision(), call CombatSystem.dealDamage(enemy, harpoonDamage), destroy harpoon
- [ ] T051 [US3] Update Enemy.js to add health property, takeDamage(amount) method, visual hit feedback (flash/shake)
- [ ] T052 [US3] In CombatSystem.dealDamage(), reduce enemy health, check if health <= 0, call onEnemyKilled()
- [ ] T053 [US3] In CombatSystem.onEnemyKilled(), spawn pearl at enemy position, destroy enemy, play death effect
- [ ] T054 [US3] In Enemy.js, add pathfinding property and currentPath array
- [ ] T055 [US3] In Enemy.js updateAI() method, call PathfindingSystem.findPath() every 0.5 seconds to player position
- [ ] T056 [US3] In PathfindingSystem.findPath(), implement A* algorithm with Manhattan distance heuristic
- [ ] T057 [US3] In PathfindingSystem.buildGrid(), convert wall positions to 2D grid for pathfinding (0=open, 1=blocked)
- [ ] T058 [US3] In Enemy.js, add chase timer (10s) and distance threshold (800px) for abandoning chase
- [ ] T059 [US3] In Enemy.js, add shouldAbandonChase() method checking timer and distance conditions
- [ ] T060 [US3] In Enemy.js updateAI(), call shouldAbandonChase(), return to patrol behavior if true
- [ ] T061 [US3] Add DashCooldown UI element to GameScene HUD showing visual cooldown progress
- [ ] T062 [US3] Update UpgradeSystem to apply harpoon damage and dash cooldown upgrades when purchased

**Checkpoint**: User Story 3 complete - Combat system functional with tactical harpoon/dash gameplay and improved AI

---

## Phase 6: User Story 4 - Visual Improvements & Sprites (Priority: P4)

**Goal**: Replace all geometric shapes with sprites (diver, enemies, clams, harpoon) using Phaser sprite atlas system

**Independent Test**: Load game and verify all entities display as sprites instead of geometric shapes. Observe animations (clam opening, diver swimming, enemy movement).

### Implementation for User Story 4

- [ ] T063 [P] [US4] Create sprite asset files: `assets/sprites/diver/` (idle, swim, dash animation frames)
- [ ] T064 [P] [US4] Create sprite asset files: `assets/sprites/enemies/` (jellyfish, squid, anglerfish sprites per zone)
- [ ] T065 [P] [US4] Create sprite asset files: `assets/sprites/clams/` (closed, opening animation frames, open)
- [ ] T066 [P] [US4] Create sprite asset files: `assets/sprites/harpoon/` (projectile sprite)
- [ ] T067 [P] [US4] Generate texture atlas: `assets/atlas/game-atlas.json` with all sprite definitions using TexturePacker or Phaser tooling
- [ ] T068 [US4] Update `src/scenes/BootScene.js` preload() to load game-atlas.json and atlas.png
- [ ] T069 [US4] Update `src/entities/Player.js` to use sprite from atlas instead of circle graphics (this.setTexture('game-atlas', 'diver-idle'))
- [ ] T070 [US4] In Player.js, add swim animation (play on movement), idle animation (play when stationary), dash animation (play during dash)
- [ ] T071 [US4] In Player.js, add sprite flip logic (flipX based on movement direction)
- [ ] T072 [US4] Update `src/entities/Enemy.js` to use zone-appropriate sprite (jellyfish/squid/anglerfish based on zone)
- [ ] T073 [US4] In Enemy.js, add movement animation, flipX based on direction
- [ ] T074 [US4] Update `src/entities/Clam.js` to use clam sprite, add opening animation (3-frame sequence transitioning closed → open)
- [ ] T075 [US4] In Clam.js, play opening animation on player interaction
- [ ] T076 [US4] Update `src/entities/Harpoon.js` to use harpoon sprite instead of rectangle
- [ ] T077 [US4] Update `src/entities/Pearl.js` to use pearl sprite instead of small circle
- [ ] T078 [US4] Remove all debug collision box outlines from entities (debugShowBody = false)
- [ ] T079 [US4] Add enemy death particle effect or sprite animation when killed

**Checkpoint**: User Story 4 complete - Professional sprite-based visuals replace geometric placeholders

---

## Phase 7: User Story 5 - Physics-Based Clam Placement (Priority: P5)

**Goal**: Clams spawn with gravity enabled, fall to rest on floors/walls like barnacles (no floating clams)

**Independent Test**: Observe clam spawning - all clams fall and settle on surfaces, zero clams floating in mid-water.

### Implementation for User Story 5

- [ ] T080 [P] [US5] Update `src/entities/Clam.js` constructor to enable arcade physics body gravity (body.setGravityY(200))
- [ ] T081 [US5] In Clam.js, add collision handling for floor/wall contact
- [ ] T082 [US5] In Clam.js onCollisionStart() callback, disable gravity (body.setGravityY(0)), make immovable (body.setImmovable(true))
- [ ] T083 [US5] In Clam.js, add 2-second timeout from spawn to force-freeze if no collision (prevents infinite falling)
- [ ] T084 [US5] Update GameScene clam spawning to spawn in mid-water positions (let physics settle them)
- [ ] T085 [US5] In GameScene, add arcade physics collider between clam group and wall group
- [ ] T086 [US5] In GameScene, verify clam-wall collisions trigger onCollisionStart() properly
- [ ] T087 [US5] Test that clams can attach to vertical wall surfaces (barnacle behavior)

**Checkpoint**: User Story 5 complete - Realistic clam placement using physics simulation

---

## Phase 8: User Story 6 - Partially Procedural Map with Landmarks (Priority: P6)

**Goal**: Map generation with fixed landmark regions (surface plateau, deep trench) and randomized wall details per run

**Independent Test**: Run game 3 times, verify landmark regions appear in same locations but wall details vary within those regions.

### Implementation for User Story 6

- [ ] T088 [P] [US6] Create `src/systems/CavernGenerator.js` (if not existing) with generateWithLandmarks(width, height, landmarks) method
- [ ] T089 [P] [US6] Update CavernGenerator to load landmarks.json and extract landmark region definitions
- [ ] T090 [US6] In CavernGenerator, implement isInLandmark(x, y, landmarks) method to check if tile is within landmark bounds
- [ ] T091 [US6] Update CavernGenerator cellular automata algorithm to use landmark-specific wall density when tile is in landmark region
- [ ] T092 [US6] In CavernGenerator, use global wall density for non-landmark tiles (allows variation between runs)
- [ ] T093 [US6] Update GameScene map generation to call CavernGenerator.generateWithLandmarks() instead of basic generate()
- [ ] T094 [US6] Verify surface plateau region (X: 50-150 tiles, Y: 0-20 tiles) has low wall density (~10%) every run
- [ ] T095 [US6] Verify deep trench region (X: 300-400 tiles, Y: 150-200 tiles) has high wall density (~50%) every run
- [ ] T096 [US6] Update clam spawning to prefer landmark regions (use landmark bounds to guide spawn positions)
- [ ] T097 [US6] Test map consistency: landmarks same position across multiple runs, wall details randomized

**Checkpoint**: User Story 6 complete - Replayable map with recognizable landmarks and procedural variation

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, optimization, and quality improvements

- [ ] T098 [P] Update all UI elements to use consistent visual style (fonts, colors, layout)
- [ ] T099 [P] Add sound effects: harpoon fire, harpoon hit, dash activate, upgrade purchase, zone transition
- [ ] T100 [P] Add background music tracks per zone (calm for Sunlight, tense for Twilight, ominous for Midnight)
- [ ] T101 Optimize sprite atlas to reduce file size (compress textures, remove unused frames)
- [ ] T102 Add loading screen with progress bar in BootScene
- [ ] T103 Add tutorial overlay on first run explaining controls (Q=harpoon, Shift=dash, ESC=surface)
- [ ] T104 Add statistics tracking to ProgressionSystem (total pearls collected, enemies killed, deepest depth reached)
- [ ] T105 Add statistics display in ShopScene (show player achievements)
- [ ] T106 Performance testing: verify 60 FPS maintained with 20+ enemies and full lighting
- [ ] T107 LocalStorage validation: test save corruption recovery, version migration
- [ ] T108 Mobile controls: add touch controls for harpoon/dash (optional, if mobile support desired)
- [ ] T109 Update README.md with new gameplay loop description and controls
- [ ] T110 Create gameplay video/GIF for documentation

**Final Checkpoint**: Roguelike transformation complete - All 6 user stories implemented and polished

---

## Dependencies & Execution Flow

**Critical Path** (must be sequential):
1. Phase 1 Setup → Phase 2 Foundational → User Stories
2. Within User Stories: Tests (if included) → Implementation

**Parallel Opportunities**:
- Phase 1 config files can all be created in parallel (T002, T003, T004)
- Phase 2 systems can be developed in parallel after LocalStorageManager (T007, T008 parallel)
- Within each User Story, tasks marked [P] can run in parallel
- User Stories P4 (sprites) and P5 (physics) can be implemented in parallel after P1-P3 complete
- Polish tasks (T098-T110) mostly parallelizable

**User Story Independence**:
- P1 (Upgrades) is foundational - required for roguelike loop
- P2 (Zones) builds on P1 but adds independent zone system
- P3 (Combat) builds on P1 upgrades but combat system is independent
- P4 (Sprites) is purely visual - can be done anytime after P1
- P5 (Clam Physics) is independent enhancement
- P6 (Map) is independent enhancement

**Suggested MVP Scope**: Complete P1 + P2 + P3 (core roguelike gameplay with zones and combat), then P4-P6 as polish

---

## Implementation Strategy

**Incremental Delivery**:
1. **Week 1**: Phase 1 + Phase 2 + P1 (MVP: basic roguelike loop with upgrades)
2. **Week 2**: P2 + P3 (depth zones and combat system)
3. **Week 3**: P4 + P5 + P6 (visual polish and enhancements)
4. **Week 4**: Phase 9 polish + bug fixes + testing

**Testing Approach** (if tests included):
- Contract tests verify API surface (upgrade purchase, damage calculation)
- Integration tests verify user journeys (quickstart.md scenarios)
- Unit tests verify isolated system logic (pathfinding, zone detection)
- Manual testing validates feel/polish (combat responsiveness, lighting transitions)

**Risk Mitigation**:
- PathfindingSystem (T056-T057) is most complex - allocate extra time, consider fallback to simpler chase
- Sprite atlas generation (T067) may need external tools - validate workflow early
- LocalStorage quota (5-10MB) - monitor save data size, implement compression if needed
- Performance with many enemies - profile early, optimize spawning if FPS drops

---

## Summary

- **Total Tasks**: 110 tasks across 9 phases
- **User Stories**: 6 stories (P1-P6) with independent implementation paths
- **Parallel Opportunities**: ~40 tasks marked [P] can run in parallel
- **MVP Scope**: P1 + P2 + P3 (~62 tasks) delivers core roguelike gameplay
- **Estimated Effort**: 3-4 weeks for full implementation including polish
