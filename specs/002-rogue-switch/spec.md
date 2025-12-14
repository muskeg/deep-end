# Feature Specification: Roguelike Transformation - Deep End

**Feature Branch**: `002-rogue-switch`  
**Created**: 2025-12-13  
**Status**: Draft - Specification Phase  
**Input**: Transform Deep End into a roguelike progression game with permanent upgrades, depth-based difficulty zones, combat mechanics, and improved visuals

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Permanent Upgrade Progression (Priority: P1)

Player purchases permanent upgrades at the surface shop using pearls collected from dives. Upgrades persist across all runs and include oxygen capacity, light radius, swim speed, and equipment. Each run starts at the surface with full oxygen, and progress is saved in browser LocalStorage.

**Why this priority**: This is the core roguelike progression loop - without persistent upgrades, there's no sense of advancement or reason to dive repeatedly. This transforms the game from level-based to progression-based gameplay.

**Independent Test**: Can be fully tested by collecting pearls in a dive, surfacing voluntarily, purchasing upgrades in the shop menu, starting a new dive, and verifying upgrades are active. Delivers the complete roguelike loop.

**Acceptance Scenarios**:

1. **Given** player has collected pearls, **When** player surfaces voluntarily (ESC key), **Then** run ends and player is taken to surface shop with pearl total displayed
2. **Given** player is in surface shop, **When** player selects an upgrade to purchase, **Then** pearl cost is deducted and upgrade is permanently applied
3. **Given** player owns oxygen upgrade, **When** new dive starts, **Then** oxygen capacity is increased according to upgrade level
4. **Given** player owns light upgrade, **When** diving, **Then** player light radius is increased according to upgrade level
5. **Given** player dies from oxygen depletion, **When** game over occurs, **Then** collected pearls are kept and player returns to surface shop
6. **Given** player has purchased upgrades, **When** browser is refreshed, **Then** all purchased upgrades persist via LocalStorage
7. **Given** player has no pearls, **When** attempting to buy upgrade, **Then** purchase is blocked with "insufficient pearls" message

---

### User Story 2 - Depth-Based Difficulty Zones (Priority: P2)

Three distinct depth zones with increasing difficulty - Sunlight Zone (0-500m), Twilight Zone (500-1500m), Midnight Zone (1500m+). Each zone has unique lighting ambiance, enemy spawn rates, enemy types, enemy speed/damage, and pearl values. Depth is displayed on HUD.

**Why this priority**: Creates risk/reward gameplay and gives players clear progression goals. Zones make the deep map feel purposeful rather than uniform, encouraging exploration and strategic decision-making about how deep to risk diving.

**Independent Test**: Can be tested by diving to different depths and observing lighting changes, enemy behavior differences, and pearl value increases. Delivers meaningful gameplay variety and challenge escalation.

**Acceptance Scenarios**:

1. **Given** player is in Sunlight Zone (0-500m), **When** swimming, **Then** ambient light is bright blue-white (current sunlight), enemies are slow/sparse, pearls are common tier (1 pearl value)
2. **Given** player descends to Twilight Zone (500-1500m), **When** entering zone, **Then** ambient light darkens significantly, new enemy types appear, spawn rate increases, pearls are rare tier (5 pearl value)
3. **Given** player descends to Midnight Zone (1500m+), **When** entering zone, **Then** ambient light is nearly black (player light essential), aggressive fast enemies spawn frequently, pearls are legendary tier (20 pearl value)
4. **Given** player is at any depth, **When** looking at HUD, **Then** current depth in meters is displayed (e.g., "Depth: 847m")
5. **Given** player crosses zone boundary, **When** transitioning, **Then** visual/audio feedback indicates zone change

---

### User Story 3 - Combat & Enemy AI Improvements (Priority: P3)

Player can fight enemies using harpoon weapon (ranged attack with ammo/cooldown) and dash ability (speed boost to escape with cooldown). Enemies use proper pathfinding (cannot phase through walls) and abandon chase after distance/time threshold. Harpoon damage and dash cooldown are upgradeable.

**Why this priority**: Fixes current enemy frustration (inescapable chase, wall-phasing) and adds active gameplay depth. Combat makes encounters tactical rather than purely avoid-or-die, supporting the roguelike challenge philosophy.

**Independent Test**: Can be tested by encountering enemies, using harpoon to defeat them, using dash to escape, and observing improved AI behavior. Delivers satisfying combat gameplay.

**Acceptance Scenarios**:

1. **Given** player has harpoon equipped, **When** player presses attack key (Q), **Then** harpoon projectile fires in movement direction, travels across screen, damages enemies on hit
2. **Given** enemy is hit by harpoon, **When** damage is applied, **Then** enemy health decreases, visual feedback shows hit (flash/shake), enemy dies if health reaches zero
3. **Given** player presses dash key (Shift), **When** dash activates, **Then** player speed doubles for 0.5 seconds, dash cooldown starts (5 seconds default)
4. **Given** enemy is chasing player, **When** player moves behind wall, **Then** enemy pathfinds around wall (does not phase through)
5. **Given** enemy has chased player for 10 seconds, **When** chase timer expires, **Then** enemy abandons chase and returns to patrol behavior
6. **Given** enemy loses line of sight for 5 seconds, **When** distance exceeds 800px, **Then** enemy gives up chase and idles
7. **Given** player has purchased harpoon damage upgrade, **When** firing harpoon, **Then** damage dealt to enemies is increased

---

### User Story 4 - Visual Improvements & Sprite System (Priority: P4)

Replace geometric shapes with recognizable sprites - diver character with tank/flippers, distinct enemy creatures per zone, clam sprites with opening animation. Remove collision box outlines. Implement sprite-based rendering while maintaining current game object architecture.

**Why this priority**: Significantly improves player experience and game feel. Visual clarity makes gameplay more intuitive (knowing what objects are at a glance). Priority 4 because game is functional without it, but greatly enhances polish and appeal.

**Independent Test**: Can be tested by loading game and observing all entities display as sprites instead of geometric shapes. Delivers professional visual presentation.

**Acceptance Scenarios**:

1. **Given** game loads, **When** player character is displayed, **Then** diver sprite is shown with oxygen tank and flippers (not cyan circle)
2. **Given** enemies spawn, **When** different zone enemies appear, **Then** each has distinct creature sprite (jellyfish in Sunlight, squid in Twilight, anglerfish in Midnight)
3. **Given** clam is closed, **When** displayed, **Then** closed clam shell sprite is shown (not gray circle)
4. **Given** player interacts with clam, **When** clam opens, **Then** opening animation plays transitioning from closed to open sprite
5. **Given** any entity is displayed, **When** rendering, **Then** collision box debug outlines are hidden (clean visual presentation)
6. **Given** entities move, **When** animating, **Then** sprites face correct direction (flip horizontally for left/right movement)

---

### User Story 5 - Physics-Based Clam Placement (Priority: P5)

Clams spawn using physics - they fall until resting on floor or walls (no floating in mid-water). Implemented with Phaser arcade physics gravity on clam bodies. Clams can attach to walls like barnacles.

**Why this priority**: Improves environmental realism and visual polish. Makes clam placement feel natural and believable. Priority 5 because functional without it, but enhances immersion.

**Independent Test**: Can be tested by observing clam spawning behavior - all clams rest on surfaces, none float freely. Delivers realistic environmental behavior.

**Acceptance Scenarios**:

1. **Given** clam spawns in level, **When** spawned in mid-water, **Then** gravity pulls clam downward until it collides with floor/wall
2. **Given** clam collides with floor, **When** contact occurs, **Then** clam becomes static (immovable) and rests on surface
3. **Given** clam collides with wall, **When** contact occurs, **Then** clam attaches to wall surface like barnacle (immovable)
4. **Given** all clams have spawned, **When** observing level, **Then** zero clams are floating in mid-water (all resting on surfaces)

---

### User Story 6 - Partially Procedural Map with Landmarks (Priority: P6)

Map layout features fixed landmark structures (cave formations, trenches, plateaus) with randomized details (exact wall patterns, clam/pearl positions). Players can learn general map geography while experiencing variation each run. Cellular Automata algorithm adjusted to respect landmark zones.

**Why this priority**: Balances replayability with learnability. Pure random maps feel anonymous; fixed maps get stale. Hybrid approach supports roguelike philosophy of learning and mastery. Priority 6 as it enhances long-term engagement but isn't critical for MVP.

**Independent Test**: Can be tested by playing multiple runs and observing consistent landmark positions with varied details. Delivers roguelike map experience.

**Acceptance Scenarios**:

1. **Given** new run starts, **When** map generates, **Then** major landmarks (large caverns, narrow passages, deep trenches) appear in consistent positions
2. **Given** player plays multiple runs, **When** exploring, **Then** wall details vary within landmarks (different edge patterns, opening sizes)
3. **Given** pearls/clams spawn, **When** generating positions, **Then** locations vary each run within appropriate depth zones
4. **Given** landmark zones are defined, **When** CA algorithm runs, **Then** walls do not override landmark geometry

---

### Edge Cases

- What happens when player has insufficient pearls to buy any upgrades?
  - Surface shop displays all upgrades with "locked" state and required pearl amounts
- How does system handle browser LocalStorage being full/unavailable?
  - Graceful fallback: display warning message, allow gameplay but don't persist progress
- What happens when player reaches maximum depth of map (bottom boundary)?
  - Hard floor prevents further descent, player must surface or die from oxygen
- How does harpoon interact with multiple enemies overlapping?
  - Harpoon damages first enemy hit (collision detected), does not pierce through
- What happens when enemy pathfinding fails (no valid path to player)?
  - Enemy idles in place for 3 seconds, then returns to patrol behavior
- How are pearl respawns handled?
  - On run start, all pearls regenerate at randomized positions within their depth zones
- What happens when player attempts to dash while dash is on cooldown?
  - Visual/audio feedback indicates cooldown remaining, action is blocked
- How does lighting transition between zones?
  - Smooth ambient light interpolation over 100px depth range at zone boundaries
- What happens when player surfaces with zero pearls collected?
  - Shop is accessible, displays pearl total (0), player can start new dive or quit
- How are enemy spawn positions validated?
  - Enemies spawn only in open water (not in walls), minimum 500px from player start position

## Requirements *(mandatory)*

### Functional Requirements

**Permanent Progression System:**
- **FR-001**: System MUST provide surface shop UI accessible at run start and after voluntary surfacing
- **FR-002**: System MUST display available upgrades with current level, cost, and description in shop UI
- **FR-003**: System MUST persist player progression data (owned upgrades, total pearls, best depth) in browser LocalStorage
- **FR-004**: System MUST restore persisted progression on game load from LocalStorage
- **FR-005**: System MUST deduct pearl cost and apply upgrade when purchased in shop
- **FR-006**: System MUST prevent upgrade purchase when player has insufficient pearls
- **FR-007**: System MUST provide "Start Dive" button in shop to begin run with full oxygen

**Upgrade Types:**
- **FR-008**: System MUST offer Oxygen Capacity upgrade (increases max oxygen by 20% per level, max 5 levels)
- **FR-009**: System MUST offer Light Radius upgrade (increases player light from 300px to 600px in 5 increments)
- **FR-010**: System MUST offer Swim Speed upgrade (increases player speed by 15% per level, max 5 levels)
- **FR-011**: System MUST offer Harpoon Damage upgrade (increases damage per level)
- **FR-012**: System MUST offer Dash Cooldown upgrade (reduces cooldown from 5s to 2s in 4 increments)
- **FR-013**: System MUST offer Sonar upgrade (reveals nearby clams/pearls within radius on minimap)

**Depth Zone System:**
- **FR-014**: System MUST define three depth zones: Sunlight (0-500m), Twilight (500-1500m), Midnight (1500m+)
- **FR-015**: System MUST display current depth in meters on HUD
- **FR-016**: System MUST adjust ambient lighting per zone (bright → dim → near-black)
- **FR-017**: System MUST scale enemy spawn rate by zone (low → medium → high)
- **FR-018**: System MUST spawn zone-specific enemy types
- **FR-019**: System MUST scale enemy speed and damage by zone
- **FR-020**: System MUST assign pearl values by zone (1 / 5 / 20 pearls per clam)

**Combat System:**
- **FR-021**: System MUST provide harpoon weapon triggered by attack key (Q)
- **FR-022**: System MUST fire harpoon projectile in player's movement direction
- **FR-023**: System MUST apply damage to enemies on harpoon collision
- **FR-024**: System MUST remove enemy when health reaches zero
- **FR-025**: System MUST provide dash ability triggered by dash key (Shift)
- **FR-026**: System MUST double player speed for 0.5 seconds when dash activates
- **FR-027**: System MUST enforce dash cooldown (5 seconds default, upgradeable)
- **FR-028**: System MUST display visual indicator of dash cooldown status on HUD

**Enemy AI Improvements:**
- **FR-029**: System MUST implement pathfinding so enemies navigate around walls
- **FR-030**: System MUST prevent enemies from phasing through solid walls
- **FR-031**: System MUST implement chase abandonment after 10 seconds of continuous chase
- **FR-032**: System MUST implement chase abandonment when player exceeds 800px distance for 5 seconds
- **FR-033**: System MUST return enemies to patrol/idle behavior after abandoning chase

**Visual Improvements:**
- **FR-034**: System MUST replace player cyan circle with diver sprite (tank, flippers, facing direction)
- **FR-035**: System MUST replace enemy shapes with zone-specific creature sprites
- **FR-036**: System MUST replace clam circles with clam shell sprites (closed/open states)
- **FR-037**: System MUST hide collision box debug outlines in production rendering
- **FR-038**: System MUST animate clam opening transition when player interacts
- **FR-039**: System MUST flip sprites horizontally based on movement direction

**Physics-Based Clams:**
- **FR-040**: System MUST apply gravity to clams on spawn until collision with surface
- **FR-041**: System MUST make clams immovable (static) after resting on floor/walls
- **FR-042**: System MUST prevent clams from floating in mid-water

**Partially Procedural Map:**
- **FR-043**: System MUST define fixed landmark zones (large caverns, trenches, narrow passes)
- **FR-044**: System MUST randomize wall detail patterns within landmarks each run
- **FR-045**: System MUST randomize clam/pearl spawn positions within appropriate zones each run
- **FR-046**: System MUST preserve landmark geometry during Cellular Automata generation

**Run Management:**
- **FR-047**: System MUST end run when oxygen reaches zero (death)
- **FR-048**: System MUST allow voluntary surfacing via ESC key (preserves collected pearls)
- **FR-049**: System MUST reset oxygen to full capacity (based on upgrades) at start of each dive
- **FR-050**: System MUST respawn all pearls at randomized positions each run

### Key Entities

- **Surface Shop**: UI menu for purchasing permanent upgrades using pearl currency; displays available upgrades with costs, current pearl total, owned upgrade levels
- **Upgrade**: Permanent player enhancement persisted across runs; types include oxygen capacity, light radius, swim speed, harpoon damage, dash cooldown, sonar range; has current level (1-5), pearl cost (scaling), effect value
- **Depth Zone**: Vertical region with distinct difficulty/aesthetics; has depth range (min/max meters), ambient light color/intensity, enemy spawn rate, enemy type list, pearl value tier
- **Harpoon**: Ranged projectile weapon; has damage value (upgradeable), projectile speed, visual sprite, collision detection with enemies
- **Dash Ability**: Temporary speed boost with cooldown; has boost multiplier (2x speed), duration (0.5s), cooldown timer (5s default, upgradeable to 2s)
- **Enemy**: Hostile creature with improved AI; has health points, damage value, movement speed (zone-scaled), patrol behavior, chase behavior with abandonment logic (time/distance thresholds), pathfinding navigation
- **Pearl Tier**: Collectible currency with value based on depth; Common (1 pearl, Sunlight Zone), Rare (5 pearls, Twilight Zone), Legendary (20 pearls, Midnight Zone)
- **Clam**: Physics-based pearl container; has gravity during spawn, becomes static on surface contact, open/closed sprite states, opening animation, pearl tier inside
- **Landmark**: Fixed map structure preserved across runs; has position, shape geometry, type (cavern/trench/passage); details (exact walls, openings) randomize within boundaries
- **Player Progression**: Persistent save data in LocalStorage; contains owned upgrades (type + level), total pearls collected (currency balance), best depth reached (record), run statistics

## Success Criteria *(mandatory)*

- Player can purchase permanent upgrades using pearls and upgrades persist across browser sessions (LocalStorage save/load verified)
- Three depth zones are visually and mechanically distinct with increasing difficulty (lighting, enemy behavior, pearl values differ per zone)
- Combat feels responsive and fair - harpoon defeats enemies, dash enables escape, enemies use pathfinding and abandon impossible chases
- All entities display as recognizable sprites (diver, zone-specific creatures, clams) instead of geometric shapes
- Clams rest on surfaces (zero clams floating in mid-water) via physics-based spawning
- Map provides both familiarity (landmarks) and variety (randomized details) across multiple runs
- Roguelike loop is satisfying - death/surfacing → shop → upgrade → dive deeper → repeat
- Game remains deployable as static files on GitHub Pages with LocalStorage persistence (no backend required)
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]
