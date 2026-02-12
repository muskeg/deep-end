# Feature Specification: Dynamic Enemy Spawning System

**Feature Branch**: `003-dynamic-enemy-spawning`  
**Created**: 2026-02-09  
**Status**: Draft - Specification Phase  
**Input**: Improve enemy generation to support continuous zone-based spawning as player descends through chunks

## Context

**Current Issues:**
- Enemies only spawn once at game start
- `openPositions` array is empty in chunk-based generation (commented as "skip for now")
- No new enemies appear as player descends to new chunks
- Zone-based enemy types not properly distributed by depth
- Deep runs feel empty after killing initial enemies

**Why This Matters:**
The roguelike progression system encourages deep dives, but without continuous enemy spawning, the game becomes progressively easier and less engaging as depth increases. Proper zone-based spawning reinforces the risk/reward balance and makes each depth zone feel distinct.

**Constants & Assumptions:**
- TILE_SIZE = 50px (grid cell size)
- CHUNK_SIZE = 10000px (200 tiles × 50px)
- Clearance measurements use pixel units for precision
- Tile counts used for grid-based calculations only

## User Scenarios & Testing

**Note on Priorities**: Priority (P1-P4) indicates business value and user impact. Implementation order may differ due to technical dependencies - see tasks.md for execution sequence.

### User Story 1 - Continuous Enemy Spawning (Priority: P1)

As player descends through chunks, new enemies spawn appropriate to current depth zone. Enemy density increases with depth. Enemies spawn in open cavern areas, never inside walls or too close to player.

**Why this priority**: Core to roguelike challenge escalation. Without continuous spawning, deep dives become trivial after clearing initial enemies.

**Independent Test**: Can be tested by descending through multiple chunks and observing new enemies appear. Enemy types match zone (jellyfish in Sunlight, squid in Twilight, anglerfish in Midnight). No enemies spawn in walls.

**Acceptance Scenarios**:

1. **Given** player descends to a new chunk, **When** chunk loads, **Then** enemies spawn in open positions within that chunk based on zone spawn rate
2. **Given** player is in Sunlight Zone (0-500m), **When** enemies spawn, **Then** only jellyfish appear at low spawn rate
3. **Given** player is in Twilight Zone (500-1500m), **When** enemies spawn, **Then** jellyfish and squid appear at medium spawn rate
4. **Given** player is in Midnight Zone (1500m+), **When** enemies spawn, **Then** anglerfish and squid appear at high spawn rate
5. **Given** enemies spawn, **When** checking positions, **Then** all enemies are in open water (not in walls), minimum 500px from player
6. **Given** player stays in one area, **When** time passes, **Then** enemies do not continuously respawn (one-time spawn per chunk)

---

### User Story 2 - Open Position Detection (Priority: P2)

System detects valid spawn positions within each chunk by sampling the generated cavern grid. Open positions are cached per chunk. Spawn positions avoid walls, narrow passages, and player vicinity.

**Why this priority**: Foundation for US1. Without accurate open position detection, enemies spawn in walls or unreachable areas.

**Independent Test**: Can be tested by inspecting cached chunk data for openPositions array. Verify positions are in navigable areas.

**Acceptance Scenarios**:

1. **Given** chunk is generated, **When** wall grid is created, **Then** system samples grid to find all open (non-wall) positions
2. **Given** open positions are detected, **When** caching chunk data, **Then** openPositions array is stored with chunk
3. **Given** spawn position is selected, **When** validating, **Then** position is in open water with 3+ tile clearance from walls
4. **Given** spawn position is selected, **When** validating, **Then** position is minimum 500px (50 tiles) from player current position
5. **Given** player moves through chunk, **When** enemies need to spawn, **Then** cached openPositions are reused (not recalculated)

---

### User Story 3 - Enemy Pool Management (Priority: P3)

System limits total active enemies to prevent performance degradation. Enemies far from player (off-screen) are culled. Enemy limit scales by zone difficulty.

**Why this priority**: Performance and gameplay balance. Too many enemies causes lag; too few makes deep zones too easy.

**Independent Test**: Can be tested by monitoring enemy count as player descends. Verify count stays within limits and off-screen enemies are removed.

**Acceptance Scenarios**:

1. **Given** enemies spawn, **When** total enemy count is checked, **Then** count does not exceed zone-specific maximum (Sunlight: 5, Twilight: 8, Midnight: 12)
2. **Given** enemy count at maximum, **When** new chunk loads, **Then** oldest off-screen enemies are culled before spawning new ones
3. **Given** enemy is >2000px from player, **When** culling check runs, **Then** enemy is marked for removal
4. **Given** enemy is culled, **When** removed, **Then** enemy is removed from enemies array, collisionSystem, and destroyed properly
5. **Given** player moves back to previous area, **When** checking for enemies, **Then** culled enemies do not respawn (one-time spawn rule maintained)

---

### User Story 4 - Spawn Rate Configuration (Priority: P4)

Spawn rates are configurable per zone via zones.json. Spawn attempts occur per chunk based on zone enemySpawnRate multiplier and chunk area.

**Why this priority**: Enables design iteration and balancing without code changes. Different zones feel distinct.

**Independent Test**: Can be tested by modifying zones.json spawn rates and observing enemy density changes in-game.

**Acceptance Scenarios**:

1. **Given** chunk in Sunlight Zone loads, **When** spawning enemies, **Then** system uses zone's enemySpawnRate (0.005) to calculate spawn count
2. **Given** chunk in Twilight Zone loads, **When** spawning enemies, **Then** system uses zone's enemySpawnRate (0.015) to calculate spawn count
3. **Given** chunk in Midnight Zone loads, **When** spawning enemies, **Then** system uses zone's enemySpawnRate (0.025) to calculate spawn count
4. **Given** chunk area is calculated, **When** determining spawn count, **Then** count = chunkArea * enemySpawnRate * (2-5 randomization factor)
5. **Given** spawn count is calculated, **When** spawning, **Then** enemy types are randomly selected from zone's enemyTypes list

---

### Edge Cases

- **What happens when chunk has no valid open positions (solid walls)?**
  - Skip enemy spawning for that chunk, log warning
- **What happens when player moves very fast through chunks?**
  - Spawn enemies in background; limit to 3 chunks worth of spawns per frame to prevent lag spikes
- **What happens when all enemy types for a zone fail to spawn (missing classes)?**
  - Fall back to basic Enemy class, log error for missing enemy type
- **How are enemy positions validated in narrow passages?**
  - Require 3-tile (150px) clearance in all directions; reject positions in corridors <6 tiles wide
- **What happens when player kills all enemies in current area?**
  - No respawning; player must descend to new chunks for more enemies (maintains roguelike tension)
- **How does enemy spawning interact with saved chunk cache?**
  - Spawned enemy IDs are NOT cached; each dive generates new enemy placements even if chunks reuse same wall layout

## Requirements

### Functional Requirements

**Open Position Detection:**
- **FR-001**: System MUST detect all open (non-wall) grid positions when generating each chunk
- **FR-002**: System MUST cache open positions array in chunk data structure alongside wall positions
- **FR-003**: System MUST filter open positions to exclude positions within 3-tile radius (150px in all directions) of any wall
- **FR-004**: System MUST exclude positions within 500px of player's spawn position (for initial chunk only)

**Zone-Based Spawning:**
- **FR-005**: System MUST spawn enemies when new chunk becomes active (loaded around player)
- **FR-006**: System MUST determine current depth zone from chunk Y position
- **FR-007**: System MUST select enemy types from current zone's enemyTypes array (zones.json)
- **FR-008**: System MUST calculate spawn count as: `chunkOpenArea × enemySpawnRate × randomMultiplier` where randomMultiplier is between 2.0 and 5.0
- **FR-009**: System MUST distribute spawn count across available valid positions randomly
- **FR-010**: System MUST apply zone multipliers (speed, damage) to spawned enemies

**Spawn Validation:**
- **FR-011**: System MUST verify spawn position is in open water (not wall tile)
- **FR-012**: System MUST verify spawn position has 150px (3-tile radius) clearance from all walls
- **FR-013**: System MUST verify spawn position is >500px from player current position
- **FR-014**: System MUST reject spawn positions in narrow passages (<300px / 6-tile width)
- **FR-015**: System MUST mark chunk as "spawned" to prevent duplicate spawning

**Enemy Pool Management:**
- **FR-016**: System MUST limit active enemy count per zone: Sunlight (5), Twilight (8), Midnight (12)
- **FR-017**: System MUST track enemy age (time since spawn) for culling priority
- **FR-018**: System MUST cull oldest off-screen enemies when limit reached before new spawns
- **FR-019**: System MUST consider enemy off-screen if >2000px from player position
- **FR-020**: System MUST remove culled enemies from enemies array, collisionSystem, and call destroy()

**Spawn Rate Configuration:**
- **FR-021**: System MUST read enemySpawnRate from zones.json for each zone
- **FR-022**: System MUST read enemyTypes array from zones.json for each zone
- **FR-023**: System MUST support enemyTypes containing: "jellyfish", "squid", "anglerfish", "eel"
- **FR-024**: System MUST randomly select enemy type from zone's enemyTypes with equal probability
- **FR-025**: System MUST handle missing enemy class gracefully (log error, use basic Enemy)

**Performance:**
- **FR-026**: System MUST limit enemy spawning to 3 chunks worth per frame (avoid lag spikes)
- **FR-027**: System MUST reuse cached openPositions (not recalculate per spawn attempt)
- **FR-028**: System MUST batch enemy spawns (create all entities, then add to systems)

### Key Entities

- **ChunkSpawnData**: Extension to cached chunk data; includes openPositions array (list of {x, y} grid coordinates), spawned flag (boolean), spawnedEnemyCount (number), spawnTimestamp (for debugging)
- **EnemySpawnManager**: New system managing enemy lifecycle; tracks active enemies per zone, handles spawn attempts on chunk load, culls off-screen enemies, enforces population limits
- **SpawnValidator**: Validates potential spawn positions; checks wall clearance (3-tile radius), player distance (>500px), passage width (>300px), open water confirmation
- **ZoneSpawnConfig**: Data from zones.json; enemySpawnRate (number 0.005-0.025), enemyTypes (array of strings), speedMultiplier, damageMultiplier, maxEnemies (per-zone limit)

## Success Criteria

- Player encounters continuous enemy presence while descending (no long empty stretches)
- Enemy types and density clearly distinguish each depth zone
- No enemies spawn inside walls or unreachable areas
- Game maintains 60 FPS with up to 12 active enemies
- Enemy population feels challenging but not overwhelming
- Chunk loading with enemy spawning completes within 100ms
- System handles 50+ chunks spawned during deep run without memory leaks
