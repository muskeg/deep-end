# Feature Quickstart: Roguelike Transformation

## Purpose
This document provides integration test scenarios for each user story, validating that the roguelike transformation works end-to-end.

---

## User Story 1: Permanent Upgrade Progression

**Goal**: Establish core roguelike loop (dive → collect → surface → upgrade → repeat)

**Prerequisites**:
- Clean LocalStorage (no save data)
- Player starts with 0 pearls
- All upgrades at level 0

**Test Scenario**:
1. Start new game → Player spawns at surface (depth 0)
2. Dive to depth 300m → Collect 3 clams (3 pearls total)
3. Die to enemy or press "Return to Surface" → ShopScene loads
4. Verify UI shows:
   - Pearl balance: 3
   - 6 upgrade types available (Oxygen, Light, Speed, Harpoon, Dash, Sonar)
   - Oxygen upgrade costs 5 pearls (grayed out)
   - All others cost 5 pearls (grayed out)
5. Dive again → Collect 5 more clams (8 pearls total)
6. Surface → Purchase Oxygen upgrade (8 - 5 = 3 pearls remaining)
7. Verify Oxygen level 1 → Next cost is 8 pearls (5 * 1.5^1)
8. Start new dive → Verify player max oxygen increased (visible in UI)
9. Check LocalStorage → Verify save data exists with:
   - pearls: 3
   - upgrades: { oxygen: 1, ... }

**Success Criteria**:
- Save/load preserves pearl balance and upgrade levels
- Upgrade costs scale exponentially (1.5x per level)
- Upgrades persist across runs
- Starting new dive applies upgrades correctly

---

## User Story 2: Depth-Based Difficulty Zones

**Goal**: Three distinct zones (Sunlight 0-500m, Twilight 500-1500m, Midnight 1500m+) with scaled difficulty

**Prerequisites**:
- Fresh game or continue from Story 1
- Player at surface

**Test Scenario**:
1. Dive to depth 100m → Verify:
   - Ambient light: Warm blue (Sunlight Zone)
   - Clams contain 1 pearl each
   - Enemies move at 0.8x speed, deal 0.8x damage
2. Dive to depth 750m → Verify:
   - Ambient light: Cooler blue (Twilight Zone)
   - Clams contain 5 pearls each
   - Enemies move at 1.2x speed, deal 1.2x damage
3. Dive to depth 2000m → Verify:
   - Ambient light: Dark blue/purple (Midnight Zone)
   - Clams contain 20 pearls each
   - Enemies move at 1.6x speed, deal 2.0x damage
4. Ascend from 550m to 450m → Verify:
   - Ambient light lerps smoothly (no sudden color pop)
   - Transition takes ~100m (1 second at normal swim speed)

**Success Criteria**:
- Zone boundaries at correct depths (500m, 1500m)
- Pearl values match zone (1/5/20)
- Enemy difficulty scales correctly
- Lighting transitions smoothly between zones

---

## User Story 3: Combat & Enemy AI Improvements

**Goal**: Add harpoon weapon, dash ability, enemy pathfinding

**Prerequisites**:
- Player has at least Harpoon level 1 and Dash level 1 (purchase if needed)
- GameScene loaded at depth 300m with enemies spawned

**Test Scenario 1 - Harpoon Combat**:
1. Face enemy and press Space → Harpoon fires
2. Verify harpoon projectile:
   - Travels in facing direction
   - Speed: 400px/s
   - Max range: 600px (destroyed after)
3. Hit enemy → Verify:
   - Enemy health decreases by harpoon damage (base 20)
   - Enemy destroyed if health <= 0
   - Pearl spawns at enemy position
4. Miss enemy (harpoon expires) → Verify no damage dealt

**Test Scenario 2 - Dash Ability**:
1. Press Shift (not on cooldown) → Dash activates
2. Verify:
   - Speed increases by 2.5x for 0.5 seconds
   - Dash effect visual (particle trail or tint)
   - Cooldown starts (3 seconds)
3. Press Shift during cooldown → Verify no effect
4. Wait 3 seconds → Press Shift again → Dash works

**Test Scenario 3 - Enemy Pathfinding**:
1. Position player behind wall obstacle (L-shaped corridor)
2. Wait for enemy to detect player → Verify:
   - Enemy does not move in straight line toward player
   - Enemy follows A* path around wall
   - Path recalculates every 0.5 seconds
3. Move player to new position → Verify enemy updates path
4. Move player >800px away → Verify enemy abandons chase (returns to patrol)

**Success Criteria**:
- Harpoon fires, hits enemies, destroys them
- Dash provides speed boost with cooldown
- Enemies navigate around obstacles using A*
- Enemies abandon chase beyond range

---

## User Story 4: Visual Improvements & Sprites

**Goal**: Replace geometric shapes with pixel art sprites

**Prerequisites**:
- Texture atlas `atlas.png` and `atlas.json` loaded in preload()
- Sprite assets for player, enemies, clams, pearls

**Test Scenario**:
1. Load GameScene → Verify:
   - Player rendered as submarine sprite (not circle)
   - Enemies rendered as anglerfish sprites (not triangles)
   - Clams rendered as clam sprites (not circles)
   - Pearls rendered as pearl sprites (not small circles)
2. Player moves → Verify sprite flips horizontally based on direction
3. Player fires harpoon → Verify harpoon sprite (not line/rectangle)
4. Clam opens → Verify open clam sprite frame
5. Enemy destroyed → Verify death animation (sprite sequence or particle effect)

**Success Criteria**:
- All geometric placeholders replaced with sprites
- Sprites animate correctly (movement, state changes)
- Atlas loads without errors
- Performance remains smooth (60 FPS target)

---

## User Story 5: Physics-Based Clam Placement

**Goal**: Clams fall with gravity and settle naturally on surfaces

**Prerequisites**:
- GameScene with walls/floor generated
- Clams spawned above floor level (Y < floor Y position)

**Test Scenario**:
1. Clam spawns at (100, 500) → Verify:
   - Gravity enabled (body.gravity.y > 0)
   - Clam falls downward
2. Clam hits floor at Y=1200 after 0.8s → Verify:
   - Gravity disabled on collision
   - Clam becomes static (body.immovable = true)
   - Clam remains at collision position
3. Clam spawns near wall, falls sideways → Verify:
   - Clam attaches to wall surface
   - Remains accessible to player
4. Clam falls for 2 seconds without collision → Verify:
   - Timeout triggers
   - Clam freezes in place (prevents falling forever)

**Success Criteria**:
- Clams fall realistically with gravity
- Clams stop on collision with walls/floor
- 2-second timeout prevents infinite falling
- Static clams remain interactable

---

## User Story 6: Partially Procedural Map with Landmarks

**Goal**: Consistent landmark positions, randomized details per run

**Prerequisites**:
- `data/landmarks.json` with landmark definitions
- Fresh game or new dive

**Test Scenario 1 - Landmark Consistency**:
1. Start dive (run 1) → Note positions of:
   - Surface plateau (X: 50-150 tiles, Y: 0-20 tiles)
   - Deep trench (X: 300-400 tiles, Y: 150-200 tiles)
2. Die and restart dive (run 2) → Verify:
   - Surface plateau in same X/Y region
   - Deep trench in same X/Y region
   - Wall patterns within regions differ from run 1

**Test Scenario 2 - Landmark Properties**:
1. Explore surface plateau → Verify:
   - Wall density ~10% (open, easy navigation)
   - Clams present (Sunlight Zone pearls)
2. Explore deep trench → Verify:
   - Wall density ~50% (tight corridors)
   - Clams present (Midnight Zone pearls)
   - Enemies more frequent

**Test Scenario 3 - Procedural Variation**:
1. Run dive 3 times → For each run:
   - Screenshot map layout
   - Compare wall details in non-landmark areas
2. Verify:
   - Overall map topology recognizable
   - Fine details (wall positions, clam locations) differ
   - Landmark regions consistent across all runs

**Success Criteria**:
- Landmarks appear in fixed regions every run
- Wall density within landmarks matches config
- Non-landmark areas procedurally generated
- Players recognize map structure but discover new paths

---

## Integration Test: Full Roguelike Loop

**Goal**: Validate all 6 user stories work together

**Prerequisites**: Clean slate (no save data, fresh install)

**End-to-End Scenario**:
1. **First Dive** (Sunlight Zone):
   - Spawn at surface with default stats
   - Dive to 300m, collect 10 clams (10 pearls)
   - Use dash to escape enemy
   - Fire harpoon, kill 1 enemy (+1 pearl = 11 total)
   - Surface via death or manual return
2. **Shop Phase**:
   - Purchase Oxygen level 1 (11 - 5 = 6 pearls)
   - Purchase Light level 1 (6 - 5 = 1 pearl)
   - Start new dive
3. **Second Dive** (Twilight Zone):
   - Verify increased oxygen capacity
   - Verify increased light radius
   - Dive to 1000m, collect 3 clams (3 * 5 = 15 pearls + 1 = 16 total)
   - Observe enemies using pathfinding around walls
   - Note consistent landmark positions
   - Surface
4. **Shop Phase 2**:
   - Purchase Harpoon level 2 (16 - 8 = 8 pearls)
   - Note new cost for level 3: 12 pearls
5. **Third Dive** (Midnight Zone):
   - Dive to 2000m
   - Collect 2 clams (2 * 20 = 40 pearls + 8 = 48 total)
   - Encounter high-difficulty enemies
   - Use upgraded harpoon (higher damage)
   - Observe dark ambient lighting
   - Clams settle with physics
   - Surface
6. **Final Verification**:
   - Check LocalStorage: pearls=48, upgrades={oxygen:1, light:1, harpoon:2, ...}
   - Restart browser tab
   - Load game → Verify all progress persists

**Success Criteria**:
- All 6 user stories functional
- No blocking bugs
- Smooth gameplay loop
- Progress persists across sessions
