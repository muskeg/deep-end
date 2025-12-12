# Quickstart: Test Scenarios for Underwater Cavern Game

**Purpose**: Manual and automated test scenarios organized by user story (TDD workflow)

## Setup Instructions

### Prerequisites
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test                    # Unit tests (Jest)
npm run test:integration    # Integration tests (Playwright)
npm run test:watch         # Watch mode for TDD
```

### Test Data
Mock levels and fixtures available in `tests/fixtures/mockLevels.js`

---

## User Story 1: Basic Navigation & Pearl Collection (P1)

### Manual Test Scenario 1.1 - Player Movement
**Objective**: Verify player responds to keyboard input

**Steps**:
1. Launch game (open `index.html` in browser)
2. Start new game
3. Press Arrow Up or W key
4. Press Arrow Down or S key
5. Press Arrow Left or A key
6. Press Arrow Right or D key

**Expected Results**:
- Player character moves up when Up/W pressed
- Player character moves down when Down/S pressed
- Player character moves left when Left/A pressed
- Player character moves right when Right/D pressed
- Movement is smooth and responsive (<100ms latency)
- Player animation changes based on direction

**Automated Test** (`tests/integration/user-story-1.spec.js`):
```javascript
test('player moves in response to keyboard input', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('#start-game');
  
  const initialPosition = await page.evaluate(() => game.player.position);
  
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(100);
  const newPosition = await page.evaluate(() => game.player.position);
  
  expect(newPosition.y).toBeLessThan(initialPosition.y);
});
```

---

### Manual Test Scenario 1.2 - Pearl Collection
**Objective**: Verify player can collect pearls from clams

**Steps**:
1. Start new game
2. Navigate player to visible clam
3. Position character next to clam (within interaction radius)
4. Press Spacebar
5. Observe clam opening animation
6. Observe pearl collection
7. Check score display

**Expected Results**:
- Clam opens when Spacebar pressed within radius
- Pearl appears during opening animation
- Pearl automatically collected
- Score increases by pearl value (10 points base)
- Collection sound plays
- Visual effect (sparkle) appears

**Automated Test**:
```javascript
test('player collects pearl from clam', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('#start-game');
  
  const initialScore = await page.evaluate(() => game.player.score);
  
  // Move to clam position
  await movePlayerTo(page, mockLevel.clams[0].position);
  await page.keyboard.press('Space');
  await page.waitForTimeout(500); // Animation time
  
  const newScore = await page.evaluate(() => game.player.score);
  expect(newScore).toBeGreaterThan(initialScore);
});
```

---

### Manual Test Scenario 1.3 - Oxygen Depletion
**Objective**: Verify oxygen depletes over time and triggers game over

**Steps**:
1. Start new game
2. Observe oxygen meter (top of screen)
3. Wait and watch meter decrease
4. Note depletion rate
5. Continue until oxygen reaches 0
6. Observe game over screen

**Expected Results**:
- Oxygen starts at 100%
- Oxygen decreases at 1% per second (Level 1)
- Oxygen meter visually updates smoothly
- Warning indicator appears at 20% oxygen
- Game over triggered at 0% oxygen
- Game over screen shows final score

**Automated Test**:
```javascript
test('oxygen depletes and triggers game over', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('#start-game');
  
  const initialOxygen = await page.evaluate(() => game.player.oxygenLevel);
  expect(initialOxygen).toBe(100);
  
  await page.waitForTimeout(5000); // Wait 5 seconds
  
  const currentOxygen = await page.evaluate(() => game.player.oxygenLevel);
  expect(currentOxygen).toBeLessThan(initialOxygen);
  expect(currentOxygen).toBeCloseTo(95, 1); // ~1% per second
  
  // Fast-forward to game over
  await page.evaluate(() => game.player.oxygenLevel = 0);
  await page.waitForSelector('#game-over-screen');
  
  expect(await page.isVisible('#game-over-screen')).toBe(true);
});
```

---

### Manual Test Scenario 1.4 - Level Completion
**Objective**: Verify level completes when all pearls collected

**Steps**:
1. Start new game
2. Collect first pearl
3. Collect second pearl
4. Collect third pearl (all pearls in Level 1)
5. Observe level completion screen

**Expected Results**:
- Level completion triggered immediately after last pearl
- Completion screen shows: final score, time taken, oxygen remaining
- "Next Level" button appears
- Player stats update

**Automated Test**:
```javascript
test('level completes when all pearls collected', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('#start-game');
  
  // Collect all pearls
  for (const clam of mockLevel.clams) {
    await movePlayerTo(page, clam.position);
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
  }
  
  await page.waitForSelector('#level-complete-screen');
  expect(await page.isVisible('#level-complete-screen')).toBe(true);
  
  const stats = await page.evaluate(() => ({
    score: game.player.score,
    time: game.currentLevel.completionTime,
    oxygen: game.player.oxygenLevel
  }));
  
  expect(stats.score).toBeGreaterThan(0);
  expect(stats.time).toBeGreaterThan(0);
});
```

---

## User Story 2: Environmental Hazards (P2)

### Manual Test Scenario 2.1 - Water Currents
**Objective**: Verify water currents affect player movement

**Steps**:
1. Start Level 2 (or later with currents enabled)
2. Navigate player into visible water current zone
3. Attempt to move against current
4. Attempt to move with current
5. Exit current zone

**Expected Results**:
- Player pushed in current direction (visual particle effect)
- Moving against current: slower progress
- Moving with current: faster progress
- Exiting current: normal movement restored
- Diagonal currents work correctly

**Automated Test**:
```javascript
test('water currents affect player movement', async ({ page }) => {
  await loadLevel(page, 2); // Level 2 has currents
  
  const current = mockLevel2.currents[0];
  await movePlayerTo(page, current.position);
  
  const velocity = await page.evaluate(() => game.player.velocity);
  
  // Check velocity has current component
  expect(velocity.x).not.toBe(0);
  expect(velocity.y).not.toBe(0);
});
```

---

### Manual Test Scenario 2.2 - Wall Collision
**Objective**: Verify player cannot move through walls

**Steps**:
1. Start any level
2. Navigate player to cavern wall
3. Attempt to move into wall
4. Observe collision response

**Expected Results**:
- Player stops at wall boundary
- No clipping through walls
- Player can slide along walls (smooth collision)
- Collision detection is consistent

**Automated Test**:
```javascript
test('player collides with walls correctly', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('#start-game');
  
  const cavern = await page.evaluate(() => game.currentLevel.cavern);
  const wallPosition = findWallTile(cavern);
  
  await movePlayerToward(page, wallPosition);
  
  const finalPosition = await page.evaluate(() => game.player.position);
  const tile = getTileAt(cavern, finalPosition);
  
  expect(tile).not.toBe('wall');
});
```

---

### Manual Test Scenario 2.3 - Terrain Oxygen Penalty
**Objective**: Verify difficult terrain increases oxygen depletion

**Steps**:
1. Start level with narrow passages
2. Note oxygen depletion rate in open water
3. Navigate through narrow passage
4. Observe oxygen depletion rate in passage
5. Exit passage to open water

**Expected Results**:
- Oxygen depletes at 1%/sec in open water
- Oxygen depletes at 1.5%/sec in narrow passages
- Depletion rate indicator updates (visual feedback)
- Rate returns to normal in open water

**Automated Test**:
```javascript
test('terrain affects oxygen depletion rate', async ({ page }) => {
  await loadLevel(page, 2);
  
  // Measure depletion in open water
  const openWaterRate = await measureDepletionRate(page, 'open');
  
  // Move to narrow passage
  await movePlayerTo(page, narrowPassagePosition);
  
  // Measure depletion in passage
  const passageRate = await measureDepletionRate(page, 'passage');
  
  expect(passageRate).toBeGreaterThan(openWaterRate);
});
```

---

## User Story 3: Hostile Creatures (P3)

### Manual Test Scenario 3.1 - Enemy Patrol
**Objective**: Verify jellyfish follow patrol paths

**Steps**:
1. Start Level 3 (or later with enemies)
2. Observe jellyfish enemy
3. Watch patrol behavior for 30 seconds
4. Note patrol path waypoints

**Expected Results**:
- Jellyfish moves along defined path
- Smooth transitions between waypoints
- Consistent patrol speed
- Path repeats continuously
- Animation matches movement direction

**Automated Test**:
```javascript
test('jellyfish patrols defined path', async ({ page }) => {
  await loadLevel(page, 3);
  
  const enemy = await page.evaluate(() => game.enemies[0]);
  expect(enemy.type).toBe('jellyfish');
  expect(enemy.state).toBe('patrol');
  
  const initialWaypoint = enemy.currentWaypoint;
  await page.waitForTimeout(3000);
  
  const newWaypoint = await page.evaluate(() => game.enemies[0].currentWaypoint);
  expect(newWaypoint).not.toBe(initialWaypoint);
});
```

---

### Manual Test Scenario 3.2 - Enemy Detection
**Objective**: Verify enemies detect and chase player

**Steps**:
1. Start level with enemies
2. Keep distance from jellyfish (outside detection radius)
3. Move player toward jellyfish
4. Enter detection radius
5. Observe enemy behavior change

**Expected Results**:
- Enemy ignores player outside radius
- Enemy detects player when entering radius
- Enemy state changes from patrol to chase
- Enemy moves toward player at chase speed
- Chase continues while player in radius

**Automated Test**:
```javascript
test('enemy detects and chases player', async ({ page }) => {
  await loadLevel(page, 3);
  
  const enemy = await page.evaluate(() => game.enemies[0]);
  const detectionPos = calculateDetectionPosition(enemy);
  
  await movePlayerTo(page, detectionPos);
  await page.waitForTimeout(500);
  
  const enemyState = await page.evaluate(() => game.enemies[0].state);
  expect(enemyState).toBe('chase');
});
```

---

### Manual Test Scenario 3.3 - Enemy Collision
**Objective**: Verify enemy collision damages player

**Steps**:
1. Start level with enemies
2. Note current oxygen level
3. Allow enemy to collide with player
4. Observe oxygen decrease
5. Check for visual feedback

**Expected Results**:
- Collision detected accurately
- Oxygen decreases by 10% per collision
- Damage sound plays
- Visual effect appears (flash/shake)
- Invulnerability period (1 second) prevents multiple hits
- Game over if oxygen reaches 0

**Automated Test**:
```javascript
test('enemy collision damages player', async ({ page }) => {
  await loadLevel(page, 3);
  
  const initialOxygen = await page.evaluate(() => game.player.oxygenLevel);
  
  // Position player to collide with enemy
  const enemyPos = await page.evaluate(() => game.enemies[0].position);
  await movePlayerTo(page, enemyPos);
  
  await page.waitForTimeout(100);
  
  const newOxygen = await page.evaluate(() => game.player.oxygenLevel);
  expect(newOxygen).toBeLessThan(initialOxygen);
  expect(newOxygen).toBe(initialOxygen - 10);
});
```

---

## User Story 4: Procedural Generation (P4)

### Manual Test Scenario 4.1 - Unique Level Generation
**Objective**: Verify each level generates with unique layout

**Steps**:
1. Start new game
2. Note Level 1 layout (screenshot)
3. Complete Level 1
4. Note Level 2 layout (screenshot)
5. Restart game
6. Note new Level 1 layout
7. Compare layouts

**Expected Results**:
- Level 1 (first game) ≠ Level 1 (second game)
- Level 1 ≠ Level 2
- Layouts are visually distinct
- All layouts are playable

**Automated Test**:
```javascript
test('levels generate with unique layouts', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Generate first level
  await page.click('#start-game');
  const layout1 = await page.evaluate(() => game.currentLevel.cavern.grid);
  
  // Restart and generate second level
  await page.click('#restart');
  await page.click('#start-game');
  const layout2 = await page.evaluate(() => game.currentLevel.cavern.grid);
  
  expect(layout1).not.toEqual(layout2);
});
```

---

### Manual Test Scenario 4.2 - Level Solvability
**Objective**: Verify all generated levels are completable

**Steps**:
1. Start new game
2. Play through Level 1-5
3. For each level, verify:
   - All clams are visible and reachable
   - Path exists from start to all clams
   - Sufficient oxygen to collect all pearls
4. Complete each level

**Expected Results**:
- Every level can be completed
- No unreachable clams
- No isolated regions
- Oxygen sufficient for collection
- Validation prevents impossible levels

**Automated Test**:
```javascript
test('all generated levels are solvable', async ({ page }) => {
  for (let level = 1; level <= 5; level++) {
    await loadLevel(page, level);
    
    const validation = await page.evaluate(() => ({
      connected: game.currentLevel.cavern.validate(),
      clamsReachable: game.currentLevel.allClamsReachable(),
      sufficientOxygen: game.currentLevel.hasEnoughOxygen()
    }));
    
    expect(validation.connected).toBe(true);
    expect(validation.clamsReachable).toBe(true);
    expect(validation.sufficientOxygen).toBe(true);
  }
});
```

---

### Manual Test Scenario 4.3 - Difficulty Progression
**Objective**: Verify difficulty increases with level number

**Steps**:
1. Complete Level 1, note: clam count, enemy count, starting oxygen
2. Complete Level 2, note same metrics
3. Complete Level 3, note same metrics
4. Compare metrics across levels

**Expected Results**:
- Clam count increases: 3-5 (L1) → 5-8 (L2) → 8-12 (L3)
- Enemy count increases: 0-1 (L1) → 2-3 (L2) → 3-5 (L3)
- Starting oxygen decreases: 100% (L1) → 90% (L2) → 80% (L3)
- Depletion rate increases: 1%/s (L1) → 1.5%/s (L2) → 2%/s (L3)

**Automated Test**:
```javascript
test('difficulty increases with level number', async ({ page }) => {
  const metrics = [];
  
  for (let level = 1; level <= 5; level++) {
    await loadLevel(page, level);
    
    metrics.push(await page.evaluate(() => ({
      level: game.currentLevel.number,
      difficulty: game.currentLevel.difficulty,
      clams: game.currentLevel.clams.length,
      enemies: game.currentLevel.enemies.length,
      oxygen: game.currentLevel.startingOxygen
    })));
  }
  
  // Verify increasing difficulty
  for (let i = 1; i < metrics.length; i++) {
    expect(metrics[i].difficulty).toBeGreaterThan(metrics[i-1].difficulty);
    expect(metrics[i].clams).toBeGreaterThanOrEqual(metrics[i-1].clams);
    expect(metrics[i].enemies).toBeGreaterThanOrEqual(metrics[i-1].enemies);
  }
});
```

---

## Performance Test Scenarios

### Performance Test 1 - Frame Rate
**Objective**: Verify game maintains 60 FPS

**Steps**:
1. Start game with FPS counter enabled (press F key)
2. Play through level with many entities
3. Monitor FPS display
4. Perform intensive actions (many enemies on screen)

**Expected Results**:
- FPS ≥ 60 in normal gameplay
- FPS ≥ 30 during intensive scenes
- No visible stuttering or lag
- Smooth animations

**Automated Test**:
```javascript
test('game maintains 60 FPS target', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('#start-game');
  
  const fps = await measureFPS(page, 5000); // 5 second sample
  
  expect(fps.average).toBeGreaterThanOrEqual(60);
  expect(fps.minimum).toBeGreaterThanOrEqual(30);
});
```

---

### Performance Test 2 - Load Time
**Objective**: Verify game loads within 3 seconds

**Steps**:
1. Clear browser cache
2. Load game page
3. Measure time from navigation to playable state
4. Verify assets loaded

**Expected Results**:
- Initial page load < 1 second
- Asset loading < 2 seconds
- Total time to playable < 3 seconds

**Automated Test**:
```javascript
test('game loads within 3 seconds', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('http://localhost:3000');
  await page.waitForSelector('#start-game');
  
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000);
});
```

---

## Test Helpers

```javascript
// Helper functions for automated tests

async function movePlayerTo(page, position) {
  await page.evaluate((pos) => {
    game.player.position = pos;
  }, position);
}

async function measureDepletionRate(page, environment) {
  const initial = await page.evaluate(() => game.player.oxygenLevel);
  await page.waitForTimeout(1000);
  const final = await page.evaluate(() => game.player.oxygenLevel);
  return initial - final;
}

async function loadLevel(page, levelNumber) {
  await page.goto('http://localhost:3000');
  await page.evaluate((num) => {
    game.loadLevel(num);
  }, levelNumber);
}

async function measureFPS(page, duration) {
  return await page.evaluate((ms) => {
    return new Promise((resolve) => {
      const samples = [];
      const startTime = performance.now();
      
      function measure() {
        const fps = game.getFPS();
        samples.push(fps);
        
        if (performance.now() - startTime < ms) {
          requestAnimationFrame(measure);
        } else {
          resolve({
            average: samples.reduce((a, b) => a + b) / samples.length,
            minimum: Math.min(...samples),
            maximum: Math.max(...samples)
          });
        }
      }
      
      requestAnimationFrame(measure);
    });
  }, duration);
}
```

---

## Summary

**Test Coverage by User Story**:
- ✅ US1: 4 manual scenarios, 4 automated tests
- ✅ US2: 3 manual scenarios, 3 automated tests
- ✅ US3: 3 manual scenarios, 3 automated tests
- ✅ US4: 3 manual scenarios, 3 automated tests
- ✅ Performance: 2 scenarios, 2 automated tests

**Total**: 15 manual test scenarios, 15 automated tests

**Status**: Complete - Ready for TDD implementation workflow
