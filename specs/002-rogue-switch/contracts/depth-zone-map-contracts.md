# Depth Zone & Map Contracts

## DepthZoneSystem API

### getCurrentZone(depth)
**Description**: Determines which zone player is currently in  
**Parameters**: `depth`: number (player Y position in meters)  
**Returns**: `DepthZone` object  
**Side Effects**: None (read-only)

**Test Scenarios**:
- Given depth 250m, when getCurrentZone called, then returns Sunlight Zone
- Given depth 750m, when getCurrentZone called, then returns Twilight Zone
- Given depth 2500m, when getCurrentZone called, then returns Midnight Zone
- Given depth exactly 500m, when getCurrentZone called, then returns Twilight Zone (boundary)

---

### updateAmbientLight(depth, lightsManager)
**Description**: Adjusts scene ambient lighting based on current depth  
**Parameters**: 
  - `depth`: number (meters)
  - `lightsManager`: Phaser.Lights.LightsManager
**Returns**: void  
**Side Effects**: Sets ambient color and intensity with lerp transitions

**Test Scenarios**:
- Given depth 0m, when updateAmbientLight called, then ambient = Sunlight Zone color
- Given depth 475m (25m from boundary), when called, then ambient lerps toward Twilight
- Given depth 500m (boundary), when called, then ambient = 50% Sunlight + 50% Twilight
- Given depth 525m (25m into Twilight), when called, then ambient mostly Twilight

---

### getEnemyMultipliers(zone)
**Description**: Returns difficulty multipliers for zone  
**Parameters**: `zone`: DepthZone object  
**Returns**: `{ speed: number, damage: number, spawnRate: number }`  
**Side Effects**: None (read-only)

**Test Scenarios**:
- Given Sunlight Zone, when getEnemyMultipliers called, then {speed: 0.8, damage: 0.8, spawnRate: 0.005}
- Given Midnight Zone, when getEnemyMultipliers called, then {speed: 1.6, damage: 2.0, spawnRate: 0.025}

---

### getPearlValue(zone)
**Description**: Returns pearl value for clams in zone  
**Parameters**: `zone`: DepthZone object  
**Returns**: `number` (1, 5, or 20)  
**Side Effects**: None (read-only)

**Test Scenarios**:
- Given Sunlight Zone, when getPearlValue called, then returns 1
- Given Twilight Zone, when getPearlValue called, then returns 5
- Given Midnight Zone, when getPearlValue called, then returns 20

---

## CavernGenerator API (Modified)

### generateWithLandmarks(width, height, landmarks)
**Description**: Generates map respecting fixed landmark regions  
**Parameters**: 
  - `width`: number (tiles)
  - `height`: number (tiles)
  - `landmarks`: Array<Landmark>
**Returns**: `2D array` (0 = open, 1 = wall)  
**Side Effects**: None (pure function)

**Algorithm**:
1. Initialize grid based on landmarks
2. For each cell, check if in landmark region
3. Use landmark's wall density if in region, else global density
4. Run CA iterations preserving landmark regions

**Test Scenarios**:
- Given surface plateau landmark (10% density), when generate called, then surface has ~10% walls
- Given deep trench landmark (50% density), when generate called, then deep area has ~50% walls
- Given multiple runs, when generate called, then landmark positions consistent but wall details vary

---

### isInLandmark(x, y, landmarks)
**Description**: Checks if tile coordinate is within any landmark region  
**Parameters**: 
  - `x, y`: number (tile coordinates)
  - `landmarks`: Array<Landmark>
**Returns**: `Landmark | null` - Matching landmark or null

**Test Scenarios**:
- Given tile (60, 5) and surface plateau (50-150, 0-20), when called, then returns plateau landmark
- Given tile (200, 5) and surface plateau (50-150, 0-20), when called, then returns null

---

## Clam Spawning API (Modified)

### spawnWithPhysics(x, y, pearlValue)
**Description**: Creates clam with gravity enabled  
**Parameters**: 
  - `x, y`: number (spawn position in pixels)
  - `pearlValue`: number (pearl count based on zone)
**Returns**: `Clam` instance  
**Side Effects**: Enables gravity, starts 2-second timeout timer

**Test Scenarios**:
- Given spawn at (100, 500), when spawnWithPhysics called, then clam falls downward
- Given clam falls for 0.5s, when hits floor, then gravity disabled, clam becomes static
- Given clam falls for 2.1s without collision, when timeout expires, then freezes in place

---

### onCollisionStart(clam, surface)
**Description**: Handles clam hitting floor or wall  
**Parameters**: 
  - `clam`: Clam entity
  - `surface`: Wall or floor body
**Returns**: void  
**Side Effects**: Disables gravity, makes clam immovable (static)

**Test Scenarios**:
- Given clam falling, when collision with floor, then gravity disabled
- Given clam falling sideways, when collision with wall, then attaches to wall
- Given static clam, when player collides, then clam can still be opened

---

## Map Persistence API

### getLandmarkDefinitions()
**Description**: Loads landmark configurations from data file  
**Parameters**: None  
**Returns**: `Array<Landmark>`  
**Side Effects**: None (cached after first load)

**Data Source**: `data/landmarks.json`

**Test Scenarios**:
- Given landmarks.json exists, when getLandmarkDefinitions called, then returns array of landmarks
- Given missing file, when called, then returns empty array and logs warning
- Given malformed JSON, when called, then returns empty array and logs error
