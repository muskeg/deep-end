# Combat & AI Contracts

## CombatSystem API

### dealDamage(source, target, amount)
**Description**: Applies damage from source entity to target entity  
**Parameters**: 
  - `source`: Entity (Harpoon, Enemy, etc.)
  - `target`: Entity (Enemy, Player)
  - `amount`: number (positive integer)
**Returns**: `{ killed: boolean, remainingHealth: number }`  
**Side Effects**: Reduces target health, triggers death if health <= 0

**Test Scenarios**:
- Given enemy with 30 health, when dealDamage(harpoon, enemy, 20) called, then enemy health = 10
- Given enemy with 10 health, when dealDamage(harpoon, enemy, 15) called, then {killed: true, remainingHealth: 0}
- Given enemy with 50 health, when dealDamage(harpoon, enemy, 60) called, then {killed: true, remainingHealth: 0}

---

### onEnemyKilled(enemy)
**Description**: Handles enemy death cleanup and stat tracking  
**Parameters**: `enemy`: Enemy entity  
**Returns**: void  
**Side Effects**: Removes enemy from scene, increments kill counter, plays effects

**Test Scenarios**:
- Given enemy killed, when onEnemyKilled called, then enemy removed from scene
- Given enemy killed, when onEnemyKilled called, then totalEnemiesDefeated increments
- Given enemy killed, when onEnemyKilled called, then death animation plays

---

## Harpoon API

### fire(origin, direction, damage)
**Description**: Creates and fires harpoon projectile  
**Parameters**: 
  - `origin`: Vector2 (player position)
  - `direction`: Vector2 (normalized movement vector)
  - `damage`: number (base + upgrade modifier)
**Returns**: `Harpoon` instance  
**Side Effects**: Creates sprite, enables physics body, adds to scene

**Test Scenarios**:
- Given player at (100, 100) facing right, when fire called, then harpoon spawns at player position
- Given direction (1, 0), when fire called, then harpoon moves rightward
- Given harpoon range 800px, when travel exceeds range, then harpoon despawns

---

### onEnemyCollision(enemy)
**Description**: Handles harpoon hitting enemy  
**Parameters**: `enemy`: Enemy entity  
**Returns**: void  
**Side Effects**: Deals damage via CombatSystem, despawns harpoon

**Test Scenarios**:
- Given harpoon damage 20, when hits enemy, then enemy takes 20 damage
- Given harpoon hits enemy, when collision occurs, then harpoon removed from scene
- Given harpoon hits two overlapping enemies, when collision occurs, then only first enemy hit

---

## DashAbility API

### canActivate()
**Description**: Checks if dash is off cooldown  
**Parameters**: None  
**Returns**: `boolean`  
**Side Effects**: None (read-only)

**Test Scenarios**:
- Given cooldown = 0ms, when canActivate called, then returns true
- Given cooldown = 2000ms, when canActivate called, then returns false

---

### activate(player)
**Description**: Triggers dash boost  
**Parameters**: `player`: Player entity  
**Returns**: void  
**Side Effects**: Doubles player speed, starts boost timer, sets cooldown

**Test Scenarios**:
- Given player speed 200, when activate called, then player speed = 400
- Given activation, when 500ms elapses, then player speed reverts to 200
- Given activation, when called again immediately, then does nothing (cooldown active)

---

### update(delta)
**Description**: Updates boost and cooldown timers  
**Parameters**: `delta`: number (milliseconds since last frame)  
**Returns**: void  
**Side Effects**: Decrements timers, ends boost if duration expires

**Test Scenarios**:
- Given boostTimer = 200ms, when update(100) called, then boostTimer = 100ms
- Given boostTimer = 50ms, when update(100) called, then boost ends, speed reverts
- Given cooldownRemaining = 1000ms, when update(500) called, then cooldownRemaining = 500ms

---

## PathfindingSystem API

### findPath(start, goal, grid)
**Description**: Calculates A* path from start to goal on tile grid  
**Parameters**: 
  - `start`: {x, y} tile coordinates
  - `goal`: {x, y} tile coordinates
  - `grid`: 2D array (0 = open, 1 = wall)
**Returns**: `Array<{x, y}>` - Path waypoints, empty array if no path

**Test Scenarios**:
- Given open path, when findPath called, then returns shortest path
- Given walls blocking, when findPath called, then returns path around walls
- Given no valid path (trapped), when findPath called, then returns empty array
- Given start === goal, when findPath called, then returns [start]

---

### manhattanDistance(a, b)
**Description**: Calculates grid distance between two points  
**Parameters**: 
  - `a`: {x, y}
  - `b`: {x, y}
**Returns**: `number` - Manhattan distance

**Test Scenarios**:
- Given a=(0,0), b=(3,4), when called, then returns 7
- Given a=(5,5), b=(5,5), when called, then returns 0

---

## Enemy AI API (Modified)

### updateAI(delta, playerPosition, grid)
**Description**: Main AI update loop  
**Parameters**: 
  - `delta`: number (ms)
  - `playerPosition`: Vector2
  - `grid`: 2D wall array
**Returns**: void  
**Side Effects**: Updates path, moves enemy, checks chase abandonment

**Test Scenarios**:
- Given player visible, when updateAI called, then enemy calculates path
- Given pathRecalcTimer expired, when updateAI called, then path recalculated
- Given chase duration > 10s, when updateAI called, then chase abandoned

---

### shouldAbandonChase(playerPosition)
**Description**: Checks if enemy should give up pursuit  
**Parameters**: `playerPosition`: Vector2  
**Returns**: `boolean`  
**Side Effects**: None (read-only)

**Logic**:
- Return true if chase duration >= 10000ms
- Return true if distance to player > 800px for 5 seconds
- Return false otherwise

**Test Scenarios**:
- Given chase for 11 seconds, when shouldAbandonChase called, then returns true
- Given distance 900px for 6 seconds, when shouldAbandonChase called, then returns true
- Given distance 700px for 8 seconds, when shouldAbandonChase called, then returns false

---

### abandonChase()
**Description**: Stops chasing player, returns to patrol  
**Parameters**: None  
**Returns**: void  
**Side Effects**: Clears path, resets chase timer, switches to patrol state

**Test Scenarios**:
- Given enemy chasing, when abandonChase called, then enemy stops moving toward player
- Given chase abandoned, when player approaches again, then new chase can begin
