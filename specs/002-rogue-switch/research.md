# Research: Roguelike Transformation Technical Decisions

**Date**: 2025-12-13  
**Feature**: Roguelike Transformation for Deep End

## Research Questions

### 1. LocalStorage Persistence Pattern
**Question**: What's the best pattern for saving/loading progression data in LocalStorage for a roguelike game?

**Decision**: Use structured save object with versioning
- **Structure**: Single JSON object with version field for schema evolution
- **Keys**: `deepend_progression_v1` for current version
- **Data**: `{ version: 1, pearls: 0, upgrades: {...}, stats: {...} }`
- **Operations**: Save on every upgrade purchase, pearl collection, and run end
- **Validation**: Check version on load, migrate if needed, fallback to defaults on corruption

**Rationale**: 
- Single key simpler than multiple keys per upgrade
- Version field enables future schema changes without breaking old saves
- JSON stringify/parse handles nested objects cleanly
- Auto-save on critical events prevents progress loss

**Implementation**: Create `LocalStorageManager` utility class with save/load/validate methods

---

### 2. Sprite System Architecture
**Question**: How should sprite rendering replace current Graphics API calls while maintaining entity architecture?

**Decision**: Phaser Sprite extension with animation system
- **Approach**: Change entities from `Phaser.GameObjects.Graphics` to `Phaser.Physics.Arcade.Sprite`
- **Atlases**: Use Phaser texture atlas with JSON metadata for animation frames
- **Animation**: Define animations in entity constructors (e.g., `diver-swim`, `clam-open`)
- **Backward Compat**: Keep existing collision bodies, physics, just change rendering

**Rationale**:
- Phaser Sprites built for game object rendering with built-in animation system
- Texture atlases standard practice for game performance (batching, memory)
- Minimal changes to existing entity logic (physics, collision unchanged)
- Animation API cleaner than manual frame switching

**Implementation**: 
1. Create sprite atlases using tool (Texture Packer or Phaser's built-in)
2. Modify entity constructors to extend Sprite instead of Graphics
3. Replace `graphics.fillCircle()` calls with `this.play('animation-name')`

---

### 3. Pathfinding Algorithm Choice
**Question**: Which pathfinding algorithm best fits Deep End's tile-based cavern structure?

**Decision**: A* (A-star) with Manhattan distance heuristic
- **Algorithm**: A* pathfinding on tile grid
- **Heuristic**: Manhattan distance (no diagonals)
- **Grid**: Existing wall grid from CavernGenerator
- **Optimization**: Cache paths for 1 second, recalculate if player moves far
- **Fallback**: If no path found (trapped), enemy idles

**Rationale**:
- A* optimal for grid-based games, finds shortest path efficiently
- Manhattan distance perfect for 4-direction movement (no diagonal walls)
- Existing tile grid already has wall data, no new structure needed
- Path caching avoids recalculating every frame (performance)

**Alternatives Rejected**:
- Dijkstra: Slower than A*, unnecessary when goal (player) is known
- Steering behaviors: Don't handle walls, would still phase through
- Navmesh: Overkill for simple tile grid

**Implementation**: Create `PathfindingSystem` with `findPath(start, goal, grid)` method

---

### 4. Depth Zone Lighting Transition
**Question**: How should lighting smoothly transition between depth zones to avoid jarring visual changes?

**Decision**: Lerp ambient light over transition range
- **Approach**: Define 100px "transition zones" at boundaries between zones
- **Method**: Linear interpolation of ambient light color/intensity based on depth
- **Example**: At 500m boundary, lerp from Sunlight (0x4488aa) to Twilight (0x223355) over 450-550m
- **Update**: Recalculate on player Y position change in update loop

**Rationale**:
- Smooth transitions feel natural vs. abrupt zone changes
- 100px range gives ~2 seconds transition time at normal swim speed
- Lerp built into Phaser, no custom interpolation code needed
- Works with existing Light2D ambient light system

**Implementation**: Add `updateAmbientLight(playerDepth)` method to DepthZoneSystem

---

### 5. Clam Physics-Based Spawning
**Question**: Should clams use physics simulation during spawning or instant placement with validation?

**Decision**: Physics simulation with timeout
- **Approach**: Spawn clams with gravity enabled, disable gravity after 2 seconds or on collision
- **Velocity**: Initial Y velocity of 0, gravity pulls down naturally
- **Collision**: Listen for collision event, make static immediately
- **Timeout**: After 2 seconds, freeze clam in place even if still falling (prevents infinite fall)
- **Validation**: Ensure spawn positions are in open space, not in walls

**Rationale**:
- Physics simulation more realistic than instant placement
- Timeout prevents edge cases (clam falls forever through bug)
- Collision detection already exists, reuse system
- Satisfies user requirement for "physics-based" feel

**Alternatives Rejected**:
- Instant placement: Less satisfying, doesn't feel "physics-based"
- Raycasting: More complex, physics simulation simpler

**Implementation**: Modify Clam constructor to enable gravity initially, add collision listener

---

### 6. Upgrade Cost Scaling Formula
**Question**: How should upgrade costs scale to balance early accessibility vs. late-game grind?

**Decision**: Exponential scaling with zone-based pearl income
- **Formula**: `cost(level) = baseCost * (1.5 ^ level)`
- **Base Costs**: 
  - Oxygen: 20 pearls
  - Light: 30 pearls
  - Speed: 40 pearls
  - Harpoon: 50 pearls
  - Dash: 60 pearls
  - Sonar: 100 pearls
- **Pearl Income**: Common (1), Rare (5), Legendary (20)
- **Balance**: 3-5 common pearls (surface) for first upgrade, requires deep diving for later levels

**Rationale**:
- Exponential scaling standard in roguelikes, creates long-term goals
- 1.5x multiplier gentler than 2x (common in idle games), avoids excessive grind
- Varied base costs create prioritization decisions (oxygen cheap, sonar expensive)
- Pearl tier system (1/5/20) aligned with risk/reward of depth zones

**Example Progression**:
- Oxygen L1: 20 pearls (20 common OR 4 rare OR 1 legendary)
- Oxygen L2: 30 pearls
- Oxygen L3: 45 pearls
- Oxygen L4: 68 pearls
- Oxygen L5: 102 pearls (max level)

**Implementation**: Define upgrade configs in `data/upgrades.json`, reference in UpgradeSystem

---

### 7. Partially Procedural Map Strategy
**Question**: How can map generation balance fixed landmarks with procedural variation?

**Decision**: Reserved regions + constrained cellular automata
- **Approach**: Define landmark "regions" (rectangular areas) that CA algorithm must preserve
- **Landmarks**: 
  - Surface plateau (0-200m): wide open area, 10% wall density
  - Twilight caves (500-1500m): large caverns with pillars, 30% wall density
  - Deep trenches (1500m+): narrow vertical passages, 50% wall density
- **CA Modification**: When generating walls, if cell is in landmark region, use region's density instead of global density
- **Randomization**: Within regions, exact wall positions vary each run

**Rationale**:
- Preserves general map layout (learnability) while adding variety (replayability)
- No special pathfinding needed, CA algorithm handles connectivity automatically
- Landmark regions give each zone distinct identity
- Simple to implement - just check region boundaries during CA generation

**Implementation**: 
1. Define landmarks in `data/landmarks.json` with region bounds and densities
2. Modify `CavernGenerator.generateInitialGrid()` to check landmark regions
3. Apply region-specific density when cell falls within landmark bounds

---

## Conclusions

**Key Decisions Summary**:
1. ✅ LocalStorage with versioned JSON objects for persistence
2. ✅ Phaser Sprite + texture atlas system for visuals
3. ✅ A* pathfinding with Manhattan heuristic for enemy AI
4. ✅ Lerp ambient light over 100px transitions for smooth zones
5. ✅ Physics simulation with timeout for clam spawning
6. ✅ Exponential upgrade costs (1.5x multiplier) with tiered pearl income
7. ✅ Reserved regions + constrained CA for partially procedural maps

**No Unresolved Clarifications** - All technical decisions made with clear rationale

**Next Phase**: Create data-model.md defining entity classes for new systems
