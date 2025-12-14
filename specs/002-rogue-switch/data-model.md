# Data Model: Roguelike Transformation

**Feature**: Roguelike Transformation for Deep End  
**Date**: 2025-12-13

## Entity Definitions

### Upgrade
**Purpose**: Represents a permanent player enhancement that persists across runs

**Attributes**:
- `type`: string - Upgrade category (oxygen, light, speed, harpoon, dash, sonar)
- `name`: string - Display name (e.g., "Oxygen Tank", "Dive Light")
- `description`: string - What the upgrade does
- `currentLevel`: number - Player's owned level (0-5, 0 = not owned)
- `maxLevel`: number - Maximum upgrade level (typically 5)
- `baseCost`: number - Pearl cost for level 1
- `costMultiplier`: number - Exponential scaling factor (1.5)
- `baseEffect`: number - Effect value at level 1
- `effectIncrement`: number - Effect increase per level

**Methods**:
- `getCost(level)`: Calculate pearl cost for specific level
- `getEffect(level)`: Calculate effect value at specific level
- `canAfford(pearls, level)`: Check if player can purchase level
- `isMaxLevel()`: Check if upgrade is fully maxed

**Example**:
```javascript
{
  type: 'oxygen',
  name: 'Oxygen Tank',
  description: 'Increases maximum oxygen capacity',
  currentLevel: 2,
  maxLevel: 5,
  baseCost: 20,
  costMultiplier: 1.5,
  baseEffect: 100, // percentage
  effectIncrement: 20 // +20% per level
}
```

---

### DepthZone
**Purpose**: Defines a vertical region with specific difficulty parameters and aesthetics

**Attributes**:
- `name`: string - Zone identifier (sunlight, twilight, midnight)
- `displayName`: string - Friendly name for UI
- `minDepth`: number - Starting depth in meters
- `maxDepth`: number - Ending depth in meters (Infinity for bottom zone)
- `ambientColor`: number - Phaser color hex for ambient light
- `ambientIntensity`: number - Light intensity (0-1)
- `enemyTypes`: array - Enemy class names spawnable in zone
- `enemySpawnRate`: number - Enemies per 1000px² of open space
- `enemySpeedMultiplier`: number - Enemy speed scale (1.0 = base)
- `enemyDamageMultiplier`: number - Enemy damage scale (1.0 = base)
- `pearlTier`: string - Pearl value tier (common, rare, legendary)
- `pearlValue`: number - Pearls per clam in zone

**Methods**:
- `containsDepth(depth)`: Check if depth falls within zone
- `getTransitionFactor(depth, otherZone)`: Calculate lerp factor for transitions

**Example**:
```javascript
{
  name: 'twilight',
  displayName: 'Twilight Zone',
  minDepth: 500,
  maxDepth: 1500,
  ambientColor: 0x223355,
  ambientIntensity: 0.4,
  enemyTypes: ['Squid', 'Jellyfish'],
  enemySpawnRate: 0.015,
  enemySpeedMultiplier: 1.3,
  enemyDamageMultiplier: 1.5,
  pearlTier: 'rare',
  pearlValue: 5
}
```

---

### Harpoon
**Purpose**: Projectile weapon entity fired by player

**Attributes**:
- `damage`: number - Base damage dealt to enemies
- `speed`: number - Projectile velocity
- `range`: number - Maximum travel distance before despawning
- `distanceTraveled`: number - Current distance from spawn point
- `direction`: Vector2 - Normalized direction of travel

**Methods**:
- `update(delta)`: Move projectile, check range
- `onEnemyHit(enemy)`: Apply damage, trigger effects, despawn
- `despawn()`: Remove from scene

**Phaser Type**: `Phaser.Physics.Arcade.Sprite`

---

### DashAbility
**Purpose**: Player speed boost ability with cooldown

**Attributes**:
- `isActive`: boolean - Currently boosting speed
- `cooldownRemaining`: number - Milliseconds until usable
- `cooldownDuration`: number - Total cooldown time (upgradeable)
- `boostDuration`: number - Duration of speed boost (500ms)
- `boostMultiplier`: number - Speed multiplier during boost (2.0x)
- `boostTimer`: number - Time remaining in current boost

**Methods**:
- `canUse()`: Check if off cooldown
- `activate()`: Start boost, set cooldown
- `update(delta)`: Update timers
- `getCooldownPercent()`: For UI display (0-1)

**Note**: Not a Phaser entity, attached to Player as component

---

### PlayerProgression
**Purpose**: Persistent save data stored in LocalStorage

**Attributes**:
- `version`: number - Save schema version for migration
- `pearls`: number - Total pearl currency balance
- `upgrades`: object - Map of upgrade type to current level
  - `oxygen`: number (0-5)
  - `light`: number (0-5)
  - `speed`: number (0-5)
  - `harpoon`: number (0-5)
  - `dash`: number (0-5)
  - `sonar`: number (0-5)
- `statistics`: object - Player achievement data
  - `bestDepth`: number - Deepest depth reached (meters)
  - `totalPearlsCollected`: number - Lifetime pearls
  - `totalDives`: number - Number of runs
  - `totalEnemiesDefeated`: number - Harpoon kills

**Methods**:
- `save()`: Serialize to LocalStorage
- `load()`: Deserialize from LocalStorage, validate, migrate if needed
- `reset()`: Clear all progression (debug/new game)
- `addPearls(amount)`: Increment pearl balance
- `spendPearls(amount)`: Decrement pearl balance
- `purchaseUpgrade(type)`: Increment upgrade level, deduct cost

---

### Enemy (Modified)
**Purpose**: Hostile creature with improved AI and health system

**New Attributes**:
- `health`: number - Current hit points
- `maxHealth`: number - Maximum hit points
- `baseDamage`: number - Oxygen damage on collision
- `currentPath`: array - A* path to player (array of {x, y} tile coords)
- `pathRecalcTimer`: number - Milliseconds until path refresh (1000ms)
- `chaseStartTime`: number - When chase began (for abandonment)
- `chaseDuration`: number - How long enemy has chased (for abandonment)
- `lastPlayerPos`: Vector2 - Player position when chase started
- `giveUpDistance`: number - Abandons chase if player exceeds (800px)
- `giveUpTime`: number - Abandons chase after duration (10000ms)

**New Methods**:
- `takeDamage(amount)`: Reduce health, trigger effects, die if health <= 0
- `calculatePath(playerPos, grid)`: Use PathfindingSystem to get A* path
- `followPath()`: Move toward next waypoint in path
- `shouldAbandonChase()`: Check time/distance thresholds
- `abandonChase()`: Return to patrol/idle

---

### Clam (Modified)
**Purpose**: Pearl container with physics-based spawning

**New Attributes**:
- `isPhysicsActive`: boolean - Whether gravity is applied
- `spawnTimer`: number - Timeout to freeze clam (2000ms)
- `pearlTier`: string - Tier of pearl inside (common/rare/legendary)
- `pearlValue`: number - Pearl count when opened

**New Methods**:
- `startPhysics()`: Enable gravity, start spawn timer
- `stopPhysics()`: Disable gravity, make static
- `onCollision()`: Stop physics on floor/wall contact

---

### Pearl (Modified)
**Purpose**: Collectible currency with tiered values

**New Attributes**:
- `tier`: string - common, rare, or legendary
- `value`: number - Pearl count (1, 5, or 20)
- `color`: number - Display color by tier

---

### Landmark
**Purpose**: Fixed map structure preserved across runs

**Attributes**:
- `name`: string - Landmark identifier
- `type`: string - Structure type (plateau, cavern, trench, passage)
- `region`: object - Rectangular bounds
  - `x`: number - Left edge (tiles)
  - `y`: number - Top edge (tiles)
  - `width`: number - Width (tiles)
  - `height`: number - Height (tiles)
- `wallDensity`: number - CA wall density in region (0-1)
- `description`: string - What this landmark represents

**Example**:
```javascript
{
  name: 'surface_plateau',
  type: 'plateau',
  region: { x: 50, y: 0, width: 100, height: 20 },
  wallDensity: 0.1,
  description: 'Wide open area near water surface'
}
```

---

## System Configurations

### Upgrade Costs (from research.md)
```javascript
{
  oxygen: { base: 20, multiplier: 1.5 },
  light: { base: 30, multiplier: 1.5 },
  speed: { base: 40, multiplier: 1.5 },
  harpoon: { base: 50, multiplier: 1.5 },
  dash: { base: 60, multiplier: 1.5 },
  sonar: { base: 100, multiplier: 1.5 }
}
```

### Zone Definitions (from research.md)
```javascript
[
  {
    name: 'sunlight',
    displayName: 'Sunlight Zone',
    minDepth: 0,
    maxDepth: 500,
    ambientColor: 0x4488aa,
    ambientIntensity: 0.8,
    enemyTypes: ['Jellyfish'],
    enemySpawnRate: 0.005,
    enemySpeedMultiplier: 0.8,
    enemyDamageMultiplier: 0.8,
    pearlTier: 'common',
    pearlValue: 1
  },
  {
    name: 'twilight',
    displayName: 'Twilight Zone',
    minDepth: 500,
    maxDepth: 1500,
    ambientColor: 0x223355,
    ambientIntensity: 0.4,
    enemyTypes: ['Squid', 'Jellyfish'],
    enemySpawnRate: 0.015,
    enemySpeedMultiplier: 1.3,
    enemyDamageMultiplier: 1.5,
    pearlTier: 'rare',
    pearlValue: 5
  },
  {
    name: 'midnight',
    displayName: 'Midnight Zone',
    minDepth: 1500,
    maxDepth: Infinity,
    ambientColor: 0x000011,
    ambientIntensity: 0.1,
    enemyTypes: ['Anglerfish', 'Squid'],
    enemySpawnRate: 0.025,
    enemySpeedMultiplier: 1.6,
    enemyDamageMultiplier: 2.0,
    pearlTier: 'legendary',
    pearlValue: 20
  }
]
```

## Relationships

```text
PlayerProgression (1) --has--> (many) Upgrade levels
PlayerProgression (1) --stores--> (1) Statistics
DepthZone (many) --spawns--> (many) Enemy types
DepthZone (many) --contains--> (many) Pearl tiers
Player (1) --owns--> (1) DashAbility
Player (1) --fires--> (many) Harpoon projectiles
Harpoon (many) --damages--> (many) Enemy
Clam (many) --contains--> (1) Pearl
Landmark (many) --constrains--> (1) Map generation
Enemy (many) --uses--> (1) PathfindingSystem
```
