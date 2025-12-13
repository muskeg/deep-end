# Feature Specification: Deep End

**Feature Branch**: `001-underwater-cavern-game`  
**Created**: 2025-12-12  
**Updated**: 2025-12-12  
**Status**: Deployed  
**Live Demo**: https://muskeg.github.io/deep-end/  
**Input**: User description: "Action arcade game where player navigates procedurally generated underwater caverns collecting pearls with oxygen-based time limit"

**Game Title**: Deep End  
**Display**: Fullscreen responsive browser game  
**Deployment**: GitHub Pages with automated CI/CD via GitHub Actions

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Cavern Navigation & Pearl Collection (Priority: P1)

Player controls a diver character using keyboard controls to navigate through a single underwater cavern level, collect pearls from clams, and manage oxygen supply before running out of time.

**Why this priority**: This forms the core gameplay loop - without basic movement, pearl collection, and oxygen management, the game cannot function. This is the minimum viable game experience.

**Independent Test**: Can be fully tested by launching the game, using arrow keys/WASD to move the character through a cavern, opening clams to collect pearls, and observing oxygen depletion leading to game over when oxygen reaches zero. Delivers a complete single-level game experience.

**Acceptance Scenarios**:

1. **Given** game starts, **When** player presses arrow keys or WASD, **Then** character moves in the corresponding direction through the cavern
2. **Given** character is near a clam, **When** player presses spacebar, **Then** clam opens and pearl is collected, pearl count increases
3. **Given** game is running, **When** time passes, **Then** oxygen level depletes gradually and is displayed on screen
4. **Given** oxygen reaches zero, **When** oxygen depletes completely, **Then** game ends and displays final level reached
5. **Given** player collects all pearls in level, **When** last pearl is collected, **Then** level completion is displayed and next level begins

---

### User Story 2 - Environmental Hazards & Obstacles (Priority: P2)

Player must navigate through caverns while avoiding environmental hazards such as moving water currents, narrow tight passages, and terrain obstacles that affect movement and oxygen consumption.

**Why this priority**: Environmental challenges add difficulty and engagement beyond simple collection, making the game more interesting and replayable. This builds upon the basic navigation from P1.

**Independent Test**: Can be tested by playing the game and encountering water currents that push the character in specific directions, navigating through tight passages that require precise control, and observing how collision with walls affects movement. Delivers increased gameplay challenge.

**Acceptance Scenarios**:

1. **Given** character enters a water current zone, **When** in the current, **Then** character is pushed in the current's direction, affecting player control
2. **Given** character encounters narrow passages, **When** navigating tight spaces, **Then** movement requires precision and may slow character speed
3. **Given** character collides with cavern walls, **When** collision occurs, **Then** character stops moving in that direction
4. **Given** character is in difficult terrain, **When** struggling through obstacles, **Then** oxygen depletes faster than in open water

---

### User Story 3 - Hostile Sea Creatures (Priority: P3)

Player must avoid or evade hostile sea creatures that patrol the caverns, adding threat and requiring strategic navigation beyond environmental hazards alone.

**Why this priority**: Enemies add active threat and strategic depth, transforming the game from pure navigation to tactical evasion gameplay. This enhances replayability but isn't essential for core functionality.

**Independent Test**: Can be tested by playing levels with enemy creatures present, observing their patrol patterns, attempting to evade them, and experiencing consequences when contact occurs (oxygen loss, time penalty, or instant game over). Delivers combat-free action challenge.

**Acceptance Scenarios**:

1. **Given** level contains hostile creatures, **When** game starts, **Then** creatures patrol along defined paths through the cavern
2. **Given** character is near a hostile creature, **When** creature detects player, **Then** creature moves toward player character
3. **Given** character contacts hostile creature, **When** collision occurs, **Then** oxygen level decreases significantly or game ends
4. **Given** player evades creatures, **When** maintaining distance from enemies, **Then** player can continue pearl collection without penalty

---

### User Story 4 - Procedural Cavern Generation & Level Progression (Priority: P4)

Each playthrough generates unique cavern layouts with increasing difficulty, providing variety and progressive challenge through multiple levels.

**Why this priority**: Procedural generation ensures high replayability and prevents memorization, but the game is playable with static levels. This enhances longevity without being critical to core gameplay.

**Independent Test**: Can be tested by playing multiple games and observing different cavern layouts, pearl distributions, and enemy placements. Advancing through levels shows increasing complexity. Delivers extended gameplay value.

**Acceptance Scenarios**:

1. **Given** player starts new game, **When** level loads, **Then** cavern layout is procedurally generated with unique structure
2. **Given** player completes a level, **When** level completion occurs, **Then** next level generates with increased difficulty (more hazards, less oxygen, more enemies)
3. **Given** player completes multiple levels, **When** progressing, **Then** visual indicators show current level number and difficulty
4. **Given** procedural generation runs, **When** creating caverns, **Then** levels are guaranteed to be solvable with all pearls accessible

---

### Edge Cases

- What happens when player tries to move outside cavern boundaries? (Character should be blocked by solid walls)
- How does system handle player running out of oxygen while collecting the last pearl? (Oxygen timer takes precedence - game over)
- What happens when two hostile creatures occupy the same space as the player? (Single collision penalty, not double)
- How does system handle player pausing during oxygen depletion? (Oxygen timer pauses when game is paused)
- What happens if procedural generation creates an impossible level? (Validation ensures all pearls are reachable before level starts)
- How does system handle very long play sessions? (Levels continue generating indefinitely with capped maximum difficulty)
- What happens when player collects a pearl while being pushed by water current? (Collection succeeds, score updates normally)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render a 2D procedurally generated underwater cavern environment in browser using HTML5 Canvas
- **FR-002**: System MUST accept keyboard input (arrow keys or WASD) for character movement in four cardinal directions
- **FR-003**: System MUST accept spacebar input for interaction with clams to collect pearls
- **FR-004**: System MUST display player character sprite that animates during movement
- **FR-005**: System MUST display oxygen level as a visible meter or percentage that depletes over time
- **FR-006**: System MUST calculate oxygen depletion at consistent rate (e.g., 1% per second baseline)
- **FR-007**: System MUST track and display current level number and pearl collection progress (e.g., "Pearls: 2/5")
- **FR-008**: System MUST place clams containing pearls at procedurally generated locations within the cavern and track pearl count accurately (one pearl per clam)
- **FR-009**: System MUST trigger level completion only when all pearls from all clams are collected (validated count)
- **FR-010**: System MUST trigger game over when oxygen reaches zero
- **FR-011**: System MUST generate water current zones that apply directional force to player character
- **FR-012**: System MUST detect collision between player character and cavern walls, preventing movement through solid terrain
- **FR-013**: System MUST detect collision between player character and clams, enabling interaction
- **FR-014**: System MUST spawn hostile sea creatures that follow patrol paths or chase behavior
- **FR-015**: System MUST detect collision between player character and hostile creatures, applying oxygen penalty
- **FR-016**: System MUST procedurally generate connected cavern layouts ensuring all areas are reachable
- **FR-017**: System MUST validate procedural levels to guarantee all pearls are accessible before gameplay starts
- **FR-018**: System MUST increase difficulty parameters (enemy count, oxygen rate, cavern complexity) with each completed level
- **FR-019**: System MUST provide pause functionality that halts oxygen depletion and enemy movement
- **FR-020**: System MUST display UI elements including oxygen meter with high-contrast white text (with black stroke for readability), level number, and pearl count progress (e.g., "Pearls: 2/5")
- **FR-021**: System MUST provide visual/audio feedback when pearls are collected, oxygen is low, or game ends
- **FR-022**: System MUST allow player to restart game after game over or level completion
- **FR-023**: System MUST render fullscreen responsive canvas that adapts to browser window size
- **FR-024**: System MUST provide scrollable game world (3x viewport size) with camera following player
- **FR-025**: System MUST keep UI elements (oxygen meter, level display, pearl count) fixed to camera view
- **FR-026**: System MUST be deployable to GitHub Pages with automated build pipeline
- **FR-027**: System MUST properly initialize pearl tracking counters (totalPearls, collectedPearls) at level start to prevent state carryover between levels

### Key Entities

- **Player Character**: The diver avatar controlled by player input; has position, velocity, oxygen level, and collision boundary
- **Cavern**: The procedurally generated environment; consists of navigable water areas and solid wall boundaries; generated using Cellular Automata algorithm
- **Clam**: Interactive collectible containing pearls; has position, open/closed state; 3-5 clams spawn per level
- **Pearl**: Collectible item dispensed from clams; all pearls must be collected to complete level
- **Oxygen Tank**: Time/resource mechanic represented as depleting percentage; determines available gameplay time
- **Water Current**: Environmental force zone; has position, direction vector, and force magnitude
- **Hostile Creature**: Enemy entity that patrols or chases player; has position, patrol path or AI behavior, collision boundary
- **Level**: Container for complete cavern configuration; includes difficulty parameters, pearl count, enemy count, oxygen starting amount

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can complete basic movement and pearl collection within 30 seconds of first launching the game (intuitive controls)
- **SC-002**: Average first-level completion time is between 45-90 seconds for new players (balanced difficulty)
- **SC-003**: Game renders at minimum 30 frames per second on standard modern browsers (Chrome, Firefox, Safari) at any window size without performance degradation
- **SC-004**: 80% of procedurally generated levels are completable within the oxygen time limit for skilled players (fair generation algorithm ensures 50%+ navigable space)
- **SC-005**: Players can distinguish between safe and dangerous areas within 5 seconds of viewing a new level (clear visual design with cyan player, gray walls, distinct entity colors)
- **SC-006**: Game loads and becomes playable within 3 seconds on standard broadband connection and adapts instantly to window resize
- **SC-009**: Pearl tracking accurately counts collected pearls with no false completions (level ends only when all pearls collected)
- **SC-010**: Game successfully deploys to production via automated CI/CD pipeline and is publicly accessible
- **SC-007**: 90% of players successfully collect at least one pearl in their first attempt (achievable core mechanic)
- **SC-008**: Players understand oxygen mechanic consequences within first 60 seconds of gameplay (clear feedback)
