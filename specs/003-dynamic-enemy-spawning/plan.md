# Implementation Plan: Dynamic Enemy Spawning System

**Branch**: `003-dynamic-enemy-spawning` | **Date**: 2026-02-09 | **Spec**: [spec.md](spec.md)  
**Status**: ✅ IMPLEMENTED - 2026-02-09

## Summary

✅ **COMPLETE**: Added continuous zone-based enemy spawning supporting deep roguelike runs. Enemies spawn as player descends through chunks, with types and density determined by current depth zone. System detects open positions during chunk generation, caches them for spawn validation, manages enemy population limits, and culls off-screen enemies.

**Implementation Results:**
- Spawn system active and functional
- Enemies spawn at zone-appropriate densities (Sunlight: sparse, Midnight: dense)
- Population limits enforced (Sunlight: 5, Twilight: 8, Midnight: 12)
- Off-screen culling active every 2 seconds
- Performance metrics tracking built-in
- Build successful with no errors

## Technical Context

**Language/Version**: JavaScript ES6+  
**Primary Dependencies**: Phaser.js 3.80+ (existing)  
**Integration Points**: ✅ CavernGenerator (open position detection), ✅ GameScene (chunk loading hooks), ✅ DepthZoneSystem (zone config), ✅ zones.json (spawn rates)  
**Testing**: Manual validation complete, automated tests pending  
**Performance**: <100ms chunk load, 60 FPS target (validation pending)  
**Constraints**: Static files only, works with existing chunk-based generation  

## Constitution Check

✅ **Specification-First Development**: Complete spec.md with 4 prioritized user stories  
✅ **Agent-Driven Workflow**: Following spec → plan → research → design → tasks flow  
✅ **TDD Requirement**: Test specifications in Phase 1 design artifacts  
✅ **Iterative Delivery**: P1 (spawning) → P2 (position detection) → P3 (culling) → P4 (config)

**Status**: PASS - Proceeding to Phase 0

## Project Structure

### Implemented Files

```
src/
├── systems/
│   ├── EnemySpawnManager.js      # ✅ NEW - manages enemy lifecycle, spawning, culling
│   ├── SpawnValidator.js          # ✅ NEW - validates spawn positions
│   ├── CavernGenerator.js         # ✅ MODIFIED - returns {grid, openPositions}
│   └── DepthZoneSystem.js         # ⏭ NOT MODIFIED - zone config already sufficient
├── scenes/
│   └── GameScene.js               # ✅ MODIFIED - spawn hooks + culling in update()
├── data/
│   └── zones.json                 # ✅ MODIFIED - added maxEnemies field per zone
└── entities/
    └── Enemy.js                   # ✅ MODIFIED - added spawnTimestamp for culling

tests/                              # ⏳ PENDING - automated tests not yet written
```

**Key Implementation Notes:**
- DepthZoneSystem did not require modification; zones.json already loaded properly
- Culling runs every 2 seconds in GameScene.update() (not every frame for performance)
- Performance metrics tracked via EnemySpawnManager.getMetrics()
- Enemy spawning respects player position (500px minimum distance)

## Phase 0: Research & Design Decisions

**Key Decisions:**
1. **Open position detection**: Sample every 5th tile in chunk grid (performance vs accuracy tradeoff)
2. **Spawn timing**: On chunk activation (when loaded around player), one-time per chunk
3. **Culling strategy**: Age-based priority (oldest off-screen enemies culled first)
4. **Enemy types**: Map string names ("jellyfish", "squid", "anglerfish", "eel") to class constructors
5. **Spawn count formula**: `openPositions.length * enemySpawnRate * random(2, 5)`

**Performance Strategy:**
- Cache open positions during chunk generation (no runtime recalculation)
- Batch spawn all enemies then add to systems (avoid incremental overhead)
- Limit to 3 chunks spawned per frame (async spawning for fast movement)

## Phase 1: Data Model & Contracts

### Entities

**ChunkSpawnData** (extension to existing chunk cache):
```javascript
{
  wallPositions: [...],      // existing
  lastRow: [...],            // existing
  openPositions: [           // NEW - {x, y} grid coords
    {x: 10, y: 5}, ...
  ],
  spawned: false,            // NEW - one-time spawn flag
  spawnedEnemyCount: 0       // NEW - for debugging/stats
}
```

**EnemySpawnManager**:
```javascript
class EnemySpawnManager {
  constructor(scene);
  onChunkLoaded(chunkIndex);        // spawn enemies for chunk
  cullOffScreenEnemies();           // remove distant enemies
  getActiveEnemyCount(zone);        // count by zone
  canSpawnInZone(zone);             // check limit
}
```

**SpawnValidator**:
```javascript
class SpawnValidator {
  isValidSpawnPosition(x, y, wallGrid, playerPos);
  hasWallClearance(x, y, wallGrid, radius);
  isInNarrowPassage(x, y, wallGrid, minWidth);
  getRandomValidPosition(openPositions, wallGrid, playerPos);
}
```

### Contracts

**zones.json Update**:
```json
{
  "zones": [
    {
      "name": "Sunlight Zone",
      "enemySpawnRate": 0.005,
      "enemyTypes": ["jellyfish"],
      "maxEnemies": 5,           // NEW
      ...
    }
  ]
}
```

**CavernGenerator.generate() Output**:
- Returns: `{ grid, openPositions }` where `openPositions = [{x, y}, ...]`

**GameScene.loadChunk() Hook**:
- After loading walls, call: `enemySpawnManager.onChunkLoaded(chunkIndex)`

## Complexity Tracking

**Justified Complexity:**
- **EnemySpawnManager**: Centralizes spawn logic, prevents scattered spawn code across GameScene; manages state (spawned chunks, enemy counts)
- **SpawnValidator**: Encapsulates validation rules; reusable for other entity spawning (clams, pearls, power-ups)
- **Open position caching**: Avoids O(n²) grid scans on every spawn attempt; amortizes cost to chunk generation
- **Age-based culling**: Fair deterministic culling (oldest first); prevents bias toward specific enemy types

**No Violations** - All complexity maps to functional requirements
