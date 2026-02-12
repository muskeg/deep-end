---
description: "Task list for Dynamic Enemy Spawning System"
---

# Tasks: Dynamic Enemy Spawning System

**Input**: Design documents from `/specs/003-dynamic-enemy-spawning/`
**Prerequisites**: plan.md, spec.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Testing Strategy**: This feature uses post-implementation testing (Phase 7) rather than strict TDD due to tight integration with existing Phaser game systems. Tests validate complete user story behavior after implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project foundation - no new files needed (existing Phaser game structure)

- [ ] T001 Review existing enemy spawning code in src/scenes/GameScene.js (spawnEntities method)
- [ ] T002 Review existing chunk generation in src/systems/CavernGenerator.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Create SpawnValidator.js in src/systems/ with position validation utilities
- [X] T004 Create EnemySpawnManager.js in src/systems/ with basic structure and constructor

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 2 - Open Position Detection (Priority: P2) 🎯

**Goal**: System detects and caches valid spawn positions during chunk generation

**Independent Test**: Inspect cached chunk data for openPositions array; verify positions are in navigable areas away from walls

### Implementation for User Story 2

- [X] T005 [US2] Modify CavernGenerator.generate() to detect open grid positions in src/systems/CavernGenerator.js
- [X] T006 [US2] Add openPositions array to chunk cache structure in src/systems/CavernGenerator.js
- [X] T007 [US2] Implement hasWallClearance(x, y, wallGrid, radius) in src/systems/SpawnValidator.js
- [X] T008 [P] [US2] Implement isInNarrowPassage(x, y, wallGrid, minWidth) in src/systems/SpawnValidator.js
- [X] T009 [P] [US2] Implement getRandomValidPosition(openPositions, wallGrid, playerPos) in src/systems/SpawnValidator.js
- [X] T010 [US2] Update GameScene.loadChunk() to store openPositions in chunk data in src/scenes/GameScene.js

**Checkpoint**: Open position detection complete - spawning can now use validated positions

---

## Phase 4: User Story 1 - Continuous Enemy Spawning (Priority: P1) 🎯 MVP

**Goal**: Enemies spawn in new chunks as player descends, with zone-appropriate types and density

**Independent Test**: Descend through multiple chunks; observe new enemies appearing with types matching current depth zone

### Implementation for User Story 1

- [X] T011 [US1] Implement onChunkLoaded(chunkIndex, chunkData) in src/systems/EnemySpawnManager.js
- [X] T012 [US1] Implement calculateSpawnCount(zone, openArea) in src/systems/EnemySpawnManager.js
- [X] T013 [US1] Implement selectEnemyType(zone) in src/systems/EnemySpawnManager.js
- [X] T014 [US1] Implement spawnEnemy(type, position, zone) in src/systems/EnemySpawnManager.js
- [X] T015 [US1] Add enemySpawnRate field to zones.json for each zone (Sunlight: 0.005, Twilight: 0.015, Midnight: 0.025)
- [X] T016 [US1] Add enemyTypes array to zones.json for each zone (Sunlight: ["jellyfish"], Twilight: ["jellyfish", "squid"], Midnight: ["anglerfish", "squid"])
- [X] T017 [US1] Hook EnemySpawnManager.onChunkLoaded() into GameScene.loadChunk() in src/scenes/GameScene.js
- [X] T018 [US1] Initialize EnemySpawnManager in GameScene.create() in src/scenes/GameScene.js
- [X] T019 [US1] Add spawned flag to chunk data structure to prevent duplicate spawning in src/scenes/GameScene.js
- [ ] T020 [US1] Verify enemy zone multipliers (speed, damage) are applied via DepthZoneSystem

**Checkpoint**: Continuous spawning functional - enemies appear as player descends with correct zone types

---

## Phase 5: User Story 3 - Enemy Pool Management (Priority: P3)

**Goal**: Limit active enemies to prevent performance issues; cull off-screen enemies intelligently

**Independent Test**: Monitor enemy count while descending; verify it stays within zone limits and off-screen enemies are removed

### Implementation for User Story 3

- [X] T021 [US3] Add maxEnemies field to zones.json for each zone (Sunlight: 5, Twilight: 8, Midnight: 12)
- [X] T022 [US3] Implement trackActiveEnemies() in src/systems/EnemySpawnManager.js to count enemies per zone
- [X] T023 [US3] Implement cullOffScreenEnemies(playerPos, limit) in src/systems/EnemySpawnManager.js
- [X] T024 [US3] Add spawnTimestamp field to Enemy constructor in src/entities/Enemy.js
- [X] T025 [US3] Modify onChunkLoaded() to check enemy limits before spawning in src/systems/EnemySpawnManager.js
- [X] T026 [US3] Call cullOffScreenEnemies() from GameScene.update() in src/scenes/GameScene.js
- [X] T027 [US3] Define off-screen distance threshold (>2000px from player) in src/systems/EnemySpawnManager.js
- [X] T032 [US3] Implement spawn batching (limit to 3 chunks per frame) in src/systems/EnemySpawnManager.js

**Checkpoint**: Enemy pool management active - performance maintained with smart culling and spawn batching

---

## Phase 6: User Story 4 - Spawn Rate Configuration (Priority: P4)

**Goal**: Zone-specific spawn rates loaded from zones.json; graceful fallback for missing enemy types

**Independent Test**: Modify spawn rates in zones.json; verify enemy density changes accordingly

### Implementation for User Story 4

- [X] T028 [P] [US4] Add error handling for missing enemy class in selectEnemyType() in src/systems/EnemySpawnManager.js
- [X] T029 [P] [US4] Add logging for spawn events (chunk, count, types) in src/systems/EnemySpawnManager.js
- [X] T030 [US4] Implement fallback to basic Enemy class when enemy type missing in src/systems/EnemySpawnManager.js
- [X] T031 [US4] Add spawn rate validation (0.0-1.0 range) when reading zones.json in src/systems/EnemySpawnManager.js

**Checkpoint**: Configuration system robust - spawn rates adjustable, errors handled gracefully

---

## Phase 7: Testing & Documentation

**Purpose**: Test coverage, performance validation, documentation

- [ ] T033 [P] Add performance metrics logging (spawn time, enemy count) in src/systems/EnemySpawnManager.js
- [ ] T034 Verify 60 FPS maintained with 12 active enemies via performance testing
- [ ] T035 [P] Write unit tests for SpawnValidator in tests/unit/systems/SpawnValidator.test.js
- [ ] T036 [P] Write unit tests for EnemySpawnManager in tests/unit/systems/EnemySpawnManager.test.js
- [ ] T037 Write E2E test for spawn behavior across zones in tests/e2e/user-story-spawning.spec.js
- [X] T038 Update plan.md with actual implementation details
- [ ] T039 Document spawn system in README.md (enemy behavior section)

---

## Dependencies

User stories can be implemented in this order (dependencies shown):

```
Phase 1-2: Setup & Foundation (required for all)
  ↓
Phase 3: US2 - Open Position Detection (P2)
  ↓ (spawning needs valid positions)
Phase 4: US1 - Continuous Spawning (P1) ← MVP DELIVERY
  ↓ (culling needs spawning active)
Phase 5: US3 - Enemy Pool Management (P3)
  ↓ (config enhances existing system)
Phase 6: US4 - Spawn Rate Configuration (P4)
  ↓
Phase 7: Polish & Testing
```

**MVP Recommendation**: Phases 1-4 (Setup → Position Detection → Spawning) delivers core value

---

## Parallel Execution Examples

Within each phase, tasks marked [P] can run simultaneously:

**Phase 3 (US2)**:
- T008 + T009 can run in parallel (different methods in SpawnValidator)

**Phase 6 (US4)**:
- T028 + T029 can run in parallel (independent error handling features)

**Phase 7 (Polish)**:
- T032 + T033 can run in parallel (different performance features)
- T035 + T036 + T037 can run in parallel (independent test files)

---

## Implementation Strategy

**MVP First (Phases 1-4)**:
- Delivers continuous enemy spawning with zone-appropriate types
- Playable end-to-end with basic enemy population

**Incremental Enhancement (Phases 5-6)**:
- Adds performance management and configuration flexibility
- Each phase independently valuable

**Quality Gates (Phase 7)**:
- Testing validates all user stories
- Performance benchmarks confirm 60 FPS target
- Documentation enables future maintenance
