# Game State Contracts

**Purpose**: Define testable interfaces for game state validation (TDD compliance)

## GameState Contract

**Interface**:
```javascript
interface GameState {
  currentLevel: number;
  player: PlayerState;
  entities: EntityState[];
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  victory: boolean;
}
```

**Test Requirements**:
- `currentLevel` must be ≥ 1
- `player` must exist when `isPlaying === true`
- `gameOver` and `victory` cannot both be true
- `isPaused === true` requires `isPlaying === true`

---

## PlayerState Contract

**Interface**:
```javascript
interface PlayerState {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  oxygenLevel: number; // 0-100
  score: number; // >= 0
  isAlive: boolean;
  canInteract: boolean;
}
```

**Test Requirements**:
- `oxygenLevel` must be 0-100 inclusive
- `score` must be non-negative
- `isAlive === false` when `oxygenLevel === 0`
- `position` must be within cavern bounds
- `canInteract === true` only when near clam

**Test Scenarios**:
1. Player starts with 100% oxygen
2. Oxygen depletes over time
3. Oxygen reaches 0 → `isAlive` becomes false → game over
4. Collecting pearl increases score
5. Enemy collision reduces oxygen

---

## CavernState Contract

**Interface**:
```javascript
interface CavernState {
  width: number;
  height: number;
  tileSize: number;
  grid: TileType[][];
  startPosition: { x: number; y: number };
  isValid: boolean;
}

type TileType = 'wall' | 'water' | 'current';
```

**Test Requirements**:
- `grid` dimensions must match `width` × `height`
- `startPosition` must be on 'water' tile
- All tiles must be one of: 'wall', 'water', 'current'
- Cavern must have single connected region
- Border tiles must all be 'wall'

**Test Scenarios**:
1. Generated cavern has valid start position
2. All water tiles are reachable from start
3. No isolated regions exist
4. Minimum 40% open water area
5. Cavern validates successfully

---

## ClamState Contract

**Interface**:
```javascript
interface ClamState {
  id: string;
  position: { x: number; y: number };
  isOpen: boolean;
  isCollected: boolean;
  pearl: PearlState;
}

interface PearlState {
  id: string;
  value: number;
  isCollected: boolean;
}
```

**Test Requirements**:
- `isCollected === true` requires `isOpen === true`
- `pearl.isCollected === true` when parent `isCollected === true`
- `position` must be on 'water' tile
- `pearl.value` must be > 0

**Test Scenarios**:
1. Clam starts closed
2. Player interaction opens clam
3. Opening clam reveals pearl
4. Collecting pearl updates score
5. Collected clam cannot be reopened

---

## EnemyState Contract

**Interface**:
```javascript
interface EnemyState {
  id: string;
  type: 'jellyfish' | 'eel';
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  state: 'patrol' | 'chase' | 'attack';
  isActive: boolean;
}
```

**Test Requirements**:
- `type` must be valid enemy type
- `state` must be valid state
- `position` must be in open water
- `isActive === false` when too far from player (optimization)

**Test Scenarios**:
1. Jellyfish patrols defined path
2. Jellyfish detects player → enters chase state
3. Eel hides until player approaches
4. Eel pursues player aggressively
5. Enemy collision damages player oxygen

---

## CollisionState Contract

**Interface**:
```javascript
interface CollisionEvent {
  entityA: string; // entity ID
  entityB: string; // entity ID
  type: 'player-wall' | 'player-enemy' | 'player-clam' | 'player-current';
  timestamp: number;
  resolved: boolean;
}
```

**Test Requirements**:
- Both `entityA` and `entityB` must exist
- `type` must match actual entity types
- `resolved === true` after collision handled
- Only one collision event per pair per frame

**Test Scenarios**:
1. Player collides with wall → movement stops
2. Player collides with enemy → oxygen decreases
3. Player collides with clam → can interact
4. Player enters current → force applied

---

## OxygenState Contract

**Interface**:
```javascript
interface OxygenState {
  currentLevel: number; // 0-100
  depletionRate: number; // % per second
  modifiers: OxygenModifier[];
}

interface OxygenModifier {
  source: 'terrain' | 'enemy' | 'powerup';
  multiplier: number; // affects depletion rate
  duration: number; // milliseconds, -1 for permanent
}
```

**Test Requirements**:
- `currentLevel` must be 0-100
- `depletionRate` must be positive
- `modifiers` affect effective depletion rate
- Game over triggered at oxygen === 0

**Test Scenarios**:
1. Oxygen depletes at base rate (1%/sec)
2. Difficult terrain increases depletion (1.5x)
3. Enemy collision causes instant drop (10%)
4. Oxygen reaches 0 → game over
5. Oxygen display updates every frame

---

## LevelState Contract

**Interface**:
```javascript
interface LevelState {
  number: number;
  difficulty: number; // 1-10
  totalClams: number;
  collectedClams: number;
  isComplete: boolean;
  startTime: number;
  completionTime: number | null;
}
```

**Test Requirements**:
- `number` must be ≥ 1
- `difficulty` must be 1-10
- `collectedClams` ≤ `totalClams`
- `isComplete === true` when `collectedClams === totalClams`
- `completionTime` set only when `isComplete === true`

**Test Scenarios**:
1. Level starts with 0 collected clams
2. Collecting pearl increments collected count
3. All clams collected → level complete
4. Level complete → transition to next level
5. Completion time recorded accurately

---

## InputState Contract

**Interface**:
```javascript
interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  interact: boolean; // spacebar
  pause: boolean; // escape
  lastInputTime: number;
}
```

**Test Requirements**:
- All key states must be boolean
- Multiple directional keys can be true (diagonal movement)
- `lastInputTime` updates on any key press
- Input processed before game logic update

**Test Scenarios**:
1. Arrow keys update movement state
2. WASD keys update movement state (alternate)
3. Spacebar triggers interaction
4. Escape toggles pause state
5. Input buffering for smooth controls

---

## Test Coverage Requirements (TDD)

**Per User Story**:

**US1 - Basic Navigation & Collection**:
- [ ] Player movement responds to keyboard input
- [ ] Player collides with walls
- [ ] Player can interact with clams
- [ ] Pearl collection increases score
- [ ] Oxygen depletes over time
- [ ] Game over when oxygen reaches 0
- [ ] Level completion when all pearls collected

**US2 - Environmental Hazards**:
- [ ] Water currents apply force to player
- [ ] Currents affect player trajectory
- [ ] Narrow passages restrict movement
- [ ] Difficult terrain increases oxygen depletion
- [ ] Collision with walls stops movement

**US3 - Hostile Creatures**:
- [ ] Enemies patrol defined paths
- [ ] Enemies detect player in radius
- [ ] Enemies chase player when detected
- [ ] Enemy collision damages player
- [ ] Multiple enemy types behave correctly

**US4 - Procedural Generation**:
- [ ] Levels generate with unique layouts
- [ ] All generated levels are solvable
- [ ] Difficulty increases with level number
- [ ] Level parameters scale correctly
- [ ] Cavern validation succeeds

---

## Mock Data for Testing

**Sample Level State**:
```javascript
const mockLevel = {
  number: 1,
  difficulty: 1,
  cavern: {
    width: 50,
    height: 50,
    startPosition: { x: 25, y: 25 }
  },
  clams: [
    { id: 'clam-1', position: { x: 10, y: 10 }, isOpen: false },
    { id: 'clam-2', position: { x: 40, y: 20 }, isOpen: false },
    { id: 'clam-3', position: { x: 30, y: 40 }, isOpen: false }
  ],
  enemies: [],
  currents: []
};
```

**Sample Player State**:
```javascript
const mockPlayer = {
  position: { x: 400, y: 400 },
  velocity: { x: 0, y: 0 },
  oxygenLevel: 100,
  score: 0,
  isAlive: true,
  canInteract: false
};
```

---

## Contract Validation

All contracts must have:
- ✅ Clear interface definition
- ✅ Validation rules
- ✅ Test scenarios per user story
- ✅ Mock data for deterministic testing
- ✅ Coverage mapped to functional requirements

**Status**: Complete - Ready for test implementation (TDD workflow)
