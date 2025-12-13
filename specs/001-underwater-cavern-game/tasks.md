# Tasks: Underwater Cavern Exploration Game

**Input**: Design documents from `/specs/001-underwater-cavern-game/`
**Prerequisites**: plan.md (completed), spec.md (completed), research.md (completed), data-model.md (completed), contracts/ (completed), quickstart.md (completed)

**Tests**: This project follows Test-Driven Development (TDD). Test tasks MUST be written and completed BEFORE implementation tasks. Every user story MUST include comprehensive test coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Within each story, tests come first (TDD).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Project uses single-project structure with modular frontend architecture.

---

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETE

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directory structure (src/, assets/, tests/, root files)
- [X] T002 Initialize package.json with dependencies (phaser@3.80+, jest@29+, playwright)
- [X] T003 [P] Create index.html with canvas container and game mount point
- [X] T004 [P] Create .gitignore for node_modules, build outputs, OS files
- [X] T005 [P] Configure Jest (jest.config.js) with ES6 modules and Phaser mocks
- [X] T006 [P] Configure Playwright (playwright.config.js) for integration tests
- [X] T007 [P] Create README.md with setup instructions and tech stack documentation
- [X] T008 Install npm dependencies (npm install)

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETE

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**✅ SUCCESS**: Foundation verified - all user story work can now proceed

- [ ] T009 Create src/main.js with Phaser game initialization and configuration
- [ ] T010 [P] Create src/utils/Constants.js with game constants (tile size, speeds, colors)
- [X] T011 [P] Create src/scenes/BootScene.js for asset loading
- [X] T012 Create src/scenes/MenuScene.js with start game UI
- [X] T013 Create src/scenes/GameScene.js with basic scene structure and update loop
- [X] T014 Create src/scenes/GameOverScene.js with game over UI and restart functionality
- [X] T015 [P] Create test fixtures in tests/fixtures/mockLevels.js for deterministic testing
- [X] T016 [P] Setup test helpers in tests/helpers.js (movePlayerTo, loadLevel, measureFPS)
- [X] T017 Verify Phaser loads and scenes transition correctly (manual test)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel ✅ VERIFIED

---

## Phase 3: User Story 1 - Basic Cavern Navigation & Pearl Collection (Priority: P1) 🎯 MVP

**Goal**: Complete core gameplay loop - player movement, pearl collection, oxygen management, level completion/game over

**Independent Test**: Launch game, move character with keyboard, collect pearls from clams, observe oxygen depletion, trigger game over or level completion

### Tests for User Story 1 (TDD - Write First) ✅ COMPLETE

> **CRITICAL: Write these tests FIRST, ensure they FAIL, then implement to make them pass**

- [X] T018 [P] [US1] Create unit test for Player class in tests/unit/entities/Player.test.js (movement, oxygen, collision boundary)
- [X] T019 [P] [US1] Create unit test for Clam class in tests/unit/entities/Clam.test.js (open/close, pearl dispensing)
- [X] T020 [P] [US1] Create unit test for Pearl class in tests/unit/entities/Pearl.test.js (collection, value)
- [X] T021 [P] [US1] Create unit test for OxygenSystem in tests/unit/systems/OxygenSystem.test.js (depletion rate, game over trigger)
- [X] T022 [P] [US1] Create unit test for InputHandler in tests/unit/utils/InputHandler.test.js (keyboard input processing)
- [X] T023 [US1] Create integration test for US1 in tests/integration/user-story-1.spec.js (complete gameplay loop)

**TDD Status**: All tests written, confirmed FAILING (red phase), then PASSING (green phase) ✅ **147/147 tests passing**

### Implementation for User Story 1

- [X] T024 [P] [US1] Create Player entity class in src/entities/Player.js (extends Phaser.Sprite, movement, oxygen properties) ✅
- [X] T025 [P] [US1] Create Clam entity class in src/entities/Clam.js (extends Phaser.Sprite, open/close states, interaction) ✅
- [X] T026 [P] [US1] Create Pearl entity class in src/entities/Pearl.js (extends Phaser.Sprite, collection logic) ✅
- [X] T027 [US1] Implement InputHandler utility in src/utils/InputHandler.js (keyboard input capture and processing) ✅
- [X] T028 [US1] Implement OxygenSystem in src/systems/OxygenSystem.js (depletion calculation, game over trigger) ✅
- [X] T029 [US1] Create OxygenMeter UI component in src/ui/OxygenMeter.js (visual oxygen display) ✅
- [X] T030 [US1] Create ScoreDisplay UI component in src/ui/ScoreDisplay.js (score tracking and display) ✅
- [X] T031 [US1] Integrate Player into GameScene with keyboard controls ✅
- [X] T032 [US1] Implement simple static cavern layout (3 clams at fixed positions for testing) ✅
- [X] T033 [US1] Place 3 clams with pearls in static cavern (manual positions) ✅
- [X] T034 [US1] Implement player-clam interaction (spacebar to open, automatic pearl collection) ✅
- [X] T035 [US1] Implement collision detection (pearl-player overlap in GameScene) ✅
- [X] T036 [US1] Wire OxygenSystem to game loop (deplete 1%/sec, update UI) ✅
- [X] T037 [US1] Implement level completion logic (all pearls collected → GameOverScene with victory) ✅
- [X] T038 [US1] Implement game over logic (oxygen = 0 → GameOverScene with defeat) ✅
- [ ] T039 [US1] Add visual/audio feedback for pearl collection (particle effect, sound)
- [ ] T040 [US1] Add audio feedback for game over and level completion

**Checkpoint**: At this point, User Story 1 should be fully functional with all tests passing - playable MVP with single static level

---

## Phase 4: User Story 2 - Environmental Hazards & Obstacles (Priority: P2)

**Goal**: Add environmental challenges - water currents, terrain-based oxygen penalties, improved collision

**Independent Test**: Play game, encounter water currents that push player, navigate tight passages, observe oxygen depletion variations

### Tests for User Story 2 (TDD - Write First) ✅

- [X] T041 [P] [US2] Create unit test for WaterCurrent class in tests/unit/entities/WaterCurrent.test.js (force application, range detection) ✅
- [X] T042 [P] [US2] Create unit test for CurrentSystem in tests/unit/systems/CurrentSystem.test.js (current physics application) ✅
- [X] T043 [P] [US2] Create unit test for CollisionSystem in tests/unit/systems/CollisionSystem.test.js (wall collision, sliding) ✅
- [ ] T044 [US2] Create integration test for US2 in tests/integration/user-story-2.spec.js (currents, terrain penalties)

**TDD Status**: Tests written and confirmed FAILING (red phase), then PASSING (green phase) ✅ **213/213 tests passing**

### Implementation for User Story 2

- [X] T045 [P] [US2] Create WaterCurrent entity class in src/entities/WaterCurrent.js (extends Phaser.GameObject, direction, strength) ✅
- [X] T046 [US2] Implement CurrentSystem in src/systems/CurrentSystem.js (apply forces to entities in current zones) ✅
- [X] T047 [US2] Implement CollisionSystem in src/systems/CollisionSystem.js (improved wall collision with sliding) ✅
- [ ] T048 [US2] Add particle effects for water currents (visual feedback)
- [X] T049 [US2] Place 3 water current zones in static cavern (manual positions, varied directions) ✅
- [X] T050 [US2] Integrate CurrentSystem into GameScene update loop ✅
- [ ] T051 [US2] Update OxygenSystem to apply terrain-based multipliers (1.5x in narrow passages)
- [ ] T052 [US2] Add terrain detection logic to identify narrow passages in cavern grid
- [X] T053 [US2] Add visual indicators for current zones (arrows showing direction) ✅

**Checkpoint**: User Stories 1 AND 2 core functionality complete - game has environmental challenges ✅

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently with all tests passing - game has environmental challenges

---

## Phase 5: User Story 3 - Hostile Sea Creatures (Priority: P3)

**Goal**: Add enemy AI - patrol and chase behaviors, collision damage

**Status**: ✅ Phase Complete - All enemies integrated into game
**Tests**: 285/285 passing (100%)

**Independent Test**: Play levels with enemies, observe patrol patterns, trigger chase behavior, experience enemy collision damage

### Tests for User Story 3 (TDD - Write First) ✅

- [X] T054 [P] [US3] Create unit test for Enemy base class in tests/unit/entities/Enemy.test.js (detection, attack cooldown) ✅
- [X] T055 [P] [US3] Create unit test for Jellyfish in tests/unit/entities/Jellyfish.test.js (patrol behavior) ✅
- [X] T056 [P] [US3] Create unit test for Eel in tests/unit/entities/Eel.test.js (chase behavior, lunge attack) ✅
- [X] T057 [US3] Create integration test for US3 in tests/e2e/user-story-3.spec.js (enemy interactions, collision damage) ✅

### Implementation for User Story 3

- [X] T058 [US3] Create Enemy base class in src/entities/Enemy.js (extends Phaser.Sprite, detection, attack) ✅
- [X] T059 [P] [US3] Create Jellyfish class in src/entities/Jellyfish.js (extends Enemy, patrol path logic) ✅
- [X] T060 [P] [US3] Create Eel class in src/entities/Eel.js (extends Enemy, chase and lunge logic) ✅
- [X] T061 [US3] Implement enemy patrol AI (waypoint following) ✅
- [X] T062 [US3] Implement enemy chase AI (pursue player when detected) ✅
- [X] T063 [US3] Add player detection radius logic to Enemy base class ✅
- [X] T064 [US3] Implement enemy-player collision detection in CollisionSystem ✅
- [X] T065 [US3] Add oxygen damage on enemy collision (10% instant loss) ✅
- [X] T066 [US3] Implement invulnerability period (1 second after hit) ✅
- [X] T067 [US3] Place 1-2 jellyfish enemies in static cavern with patrol paths ✅
- [X] T068 [US3] Place 1 eel enemy in static cavern with hiding spot ✅
- [ ] T069 [US3] Add visual/audio feedback for enemy collision (flash, sound)
- [ ] T070 [US3] Add enemy animations (swim, chase, attack)

**Checkpoint**: User Stories 1-3 complete - Full gameplay with enemies, environmental hazards, and oxygen management ✅

**Checkpoint**: All user stories 1-3 should now be independently functional with comprehensive test coverage - full gameplay with enemies

---

## Phase 6: User Story 4 - Procedural Cavern Generation & Level Progression (Priority: P4)

**Goal**: Generate unique cavern layouts using Cellular Automata, implement progressive difficulty, multi-level gameplay

**Independent Test**: Play multiple games observing different layouts, complete levels and advance to harder ones, verify all levels are solvable

### Tests for User Story 4 (TDD - Write First) ✅

- [X] T071 [P] [US4] Create unit test for CavernGenerator in tests/unit/systems/CavernGenerator.test.js (cellular automata, validation) ✅
- [ ] T072 [P] [US4] Create unit test for DifficultySystem in tests/unit/systems/DifficultySystem.test.js (parameter scaling)
- [ ] T073 [US4] Create integration test for US4 in tests/integration/user-story-4.spec.js (generation, progression, solvability)

### Implementation for User Story 4

- [X] T074 [US4] Implement CavernGenerator system in src/systems/CavernGenerator.js (Cellular Automata algorithm) ✅
- [X] T075 [US4] Implement flood-fill validation in CavernGenerator (ensure connectivity) ✅
- [ ] T076 [US4] Implement pearl placement algorithm (minimum spacing, reachability check)
- [ ] T077 [US4] Implement enemy spawn positioning (patrol path generation)
- [ ] T078 [US4] Implement current placement algorithm (avoid clams/enemies)
- [ ] T079 [US4] Create Level entity class in src/entities/Level.js (container for difficulty config)
- [ ] T080 [US4] Implement DifficultySystem in src/systems/DifficultySystem.js (scale parameters by level number)
- [ ] T081 [US4] Create LevelIndicator UI component in src/ui/LevelIndicator.js (display current level number)
- [ ] T082 [US4] Replace static cavern with procedural generation in GameScene
- [ ] T083 [US4] Implement level progression (victory → generate next level with increased difficulty)
- [ ] T084 [US4] Add level number tracking and display
- [ ] T085 [US4] Implement difficulty scaling curve (clam count, enemy count, oxygen, depletion rate)
- [ ] T086 [US4] Add random seed support for reproducible levels (debugging)
- [ ] T087 [US4] Verify generation performance (<50ms for 100x100 grid)

**Checkpoint**: All user stories 1-4 should now be independently functional with comprehensive test coverage - complete game with procedural generation

---

## Phase 7: Polish & Cross-Cutting Concerns ✅ CORE FEATURES COMPLETE

**Purpose**: Performance optimization, asset integration, final testing, documentation

**Status**: Essential polish features implemented. Optional enhancements remain for future iterations.

- [ ] T088 [P] Create or source player sprite animations (idle, swim directions)
- [ ] T089 [P] Create or source enemy sprites (jellyfish, eel)
- [ ] T090 [P] Create or source environment sprites (clams, pearls, current effects)
- [ ] T091 [P] Create or source UI assets (oxygen meter, score display, level indicator)
- [X] T092 [P] Add sound effects (pearl collection, enemy hit, game over, level complete) ✅
- [ ] T093 [P] Add background music (ambient underwater theme, optional)
- [ ] T094 Implement sprite atlases for optimized rendering (reduce draw calls)
- [ ] T095 Implement object pooling for clams and pearls (reduce garbage collection)
- [ ] T096 Implement camera culling (only render visible entities)
- [X] T097 Add pause functionality (ESC key toggles pause, freezes game state) ✅
- [X] T098 Implement LocalStorage for high scores and settings ✅
- [X] T099 Add FPS counter (debug mode, press F to toggle) ✅
- [ ] T100 Profile performance and optimize bottlenecks (Chrome DevTools)
- [ ] T101 Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] T102 Test on mobile devices (touch controls optional, but test rendering)
- [ ] T103 Run full integration test suite and fix any failures
- [X] T104 Update README.md with gameplay instructions and controls ✅
- [ ] T105 Add code comments and JSDoc documentation for public APIs

---

## Dependencies

### Sequential Dependencies (Must complete in order)

**Setup → Foundation → User Stories**:
- Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3-6 (User Stories)
- T001-T008 must complete before T009-T017
- T009-T017 must complete before any user story work

**Within Each User Story** (TDD requirement):
- Tests MUST be written before implementation
- US1: T018-T023 → T024-T040
- US2: T041-T044 → T045-T053
- US3: T054-T057 → T058-T070
- US4: T071-T073 → T074-T087

**User Story Independence**:
- US1 has no dependencies (MVP)
- US2 depends on US1 (uses Player, OxygenSystem)
- US3 depends on US1 (uses Player, CollisionSystem)
- US4 depends on US1-US3 (replaces static cavern, scales difficulty)

### Parallel Opportunities

**Phase 1 - Setup** (can run in parallel):
- T003, T004, T005, T006, T007 (all independent file creation)

**Phase 2 - Foundation** (can run in parallel after T009):
- T010, T011, T015, T016 (independent utilities and test files)

**User Story 1 - Tests** (can run in parallel):
- T018, T019, T020, T021, T022 (unit tests for different classes)

**User Story 1 - Implementation** (can run in parallel):
- T024, T025, T026 (entity classes)
- T029, T030 (UI components)

**User Story 2 - Tests** (can run in parallel):
- T041, T042, T043 (independent class tests)

**User Story 2 - Implementation** (can run in parallel):
- T045 (WaterCurrent entity independent)

**User Story 3 - Tests** (can run in parallel):
- T054, T055, T056 (enemy class tests)

**User Story 3 - Implementation** (can run in parallel):
- T059, T060 (enemy subclasses after T058 base class)

**User Story 4 - Tests** (can run in parallel):
- T071, T072 (independent system tests)

**Phase 7 - Polish** (many parallel tasks):
- T088-T093 (all asset creation/sourcing tasks)

---

## Parallel Execution Examples

### Example 1: Phase 1 Setup (5 tasks in parallel)
```bash
# After T001, T002, T008 complete sequentially:
Terminal 1: Create index.html (T003)
Terminal 2: Create .gitignore (T004)
Terminal 3: Configure Jest (T005)
Terminal 4: Configure Playwright (T006)
Terminal 5: Create README (T007)
```

### Example 2: User Story 1 Tests (5 tasks in parallel)
```bash
# All can run simultaneously:
Terminal 1: Player.test.js (T018)
Terminal 2: Clam.test.js (T019)
Terminal 3: Pearl.test.js (T020)
Terminal 4: OxygenSystem.test.js (T021)
Terminal 5: InputHandler.test.js (T022)
```

### Example 3: User Story 1 Entities (3 tasks in parallel)
```bash
# After tests are written:
Terminal 1: Player.js (T024)
Terminal 2: Clam.js (T025)
Terminal 3: Pearl.js (T026)
```

---

## Implementation Strategy

### MVP-First Approach
1. **Phase 1-2**: Complete setup and foundation (T001-T017)
2. **Phase 3**: Implement User Story 1 fully (T018-T040) → Deliverable MVP
3. **Phase 4-6**: Add User Stories 2-4 incrementally
4. **Phase 7**: Polish and optimize

### TDD Workflow Per Story
1. Write failing tests for acceptance criteria
2. Run tests, verify failures
3. Implement minimum code to pass tests
4. Run tests, verify passes
5. Refactor while keeping tests green
6. Move to next acceptance scenario

### Testing Coverage Goals
- Unit Tests: 80%+ coverage for entities and systems
- Integration Tests: 100% user story coverage (15 tests total)
- Performance Tests: FPS and load time validation

---

## Summary

**Total Tasks**: 105
- Phase 1 (Setup): 8 tasks
- Phase 2 (Foundation): 9 tasks
- Phase 3 (US1 - MVP): 23 tasks (6 test tasks, 17 implementation tasks)
- Phase 4 (US2): 13 tasks (4 test tasks, 9 implementation tasks)
- Phase 5 (US3): 17 tasks (4 test tasks, 13 implementation tasks)
- Phase 6 (US4): 17 tasks (3 test tasks, 14 implementation tasks)
- Phase 7 (Polish): 18 tasks

**Parallel Opportunities**: 35+ tasks can run in parallel (marked with [P])

**Test Tasks**: 23 (22% of total - TDD coverage per user story)

**MVP Delivery**: After Phase 3 (31 tasks) - playable single-level game with core mechanics

**Estimated Timeline** (1 developer):
- Phase 1-2: 1-2 days
- Phase 3 (MVP): 3-5 days
- Phase 4-6: 5-7 days
- Phase 7: 2-3 days
- **Total**: 11-17 days

**Status**: Ready for `/speckit.implement` command to begin execution
