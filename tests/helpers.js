/**
 * Test Helper Functions
 * Utilities for unit and integration testing
 */

/**
 * Move player to specific grid position
 * @param {Object} player - Player entity instance
 * @param {number} gridX - Target grid X coordinate
 * @param {number} gridY - Target grid Y coordinate
 * @param {number} tileSize - Tile size in pixels
 */
export function movePlayerTo(player, gridX, gridY, tileSize = 32) {
  const pixelX = gridX * tileSize + tileSize / 2;
  const pixelY = gridY * tileSize + tileSize / 2;
  player.x = pixelX;
  player.y = pixelY;
}

/**
 * Load mock level data into scene
 * @param {Phaser.Scene} scene - Scene instance
 * @param {Object} levelData - Mock level data from fixtures
 * @returns {Object} References to created entities
 */
export function loadLevel(scene, levelData) {
  const entities = {
    player: null,
    clams: [],
    enemies: [],
    currents: [],
    walls: []
  };

  // Create player
  if (levelData.entities.player) {
    // Placeholder - will be replaced with actual Player class in Phase 3
    entities.player = {
      x: levelData.entities.player.x,
      y: levelData.entities.player.y,
      gridX: levelData.entities.player.x,
      gridY: levelData.entities.player.y
    };
  }

  // Create clams
  levelData.entities.clams.forEach(clamData => {
    entities.clams.push({
      x: clamData.x,
      y: clamData.y,
      hasPearl: clamData.hasPearl,
      isOpen: false
    });
  });

  // Create enemies
  levelData.entities.enemies.forEach(enemyData => {
    entities.enemies.push({
      type: enemyData.type,
      x: enemyData.x,
      y: enemyData.y,
      patrolPath: enemyData.patrolPath || []
    });
  });

  // Create currents
  levelData.entities.currents.forEach(currentData => {
    entities.currents.push({
      x: currentData.x,
      y: currentData.y,
      direction: currentData.direction,
      strength: currentData.strength
    });
  });

  return entities;
}

/**
 * Measure FPS over specified duration
 * @param {Phaser.Scene} scene - Scene instance
 * @param {number} durationMs - Measurement duration in milliseconds
 * @returns {Promise<Object>} FPS statistics
 */
export async function measureFPS(scene, durationMs = 1000) {
  return new Promise((resolve) => {
    const samples = [];
    const startTime = Date.now();

    const measureFrame = () => {
      const fps = scene.game.loop.actualFps;
      samples.push(fps);

      if (Date.now() - startTime < durationMs) {
        requestAnimationFrame(measureFrame);
      } else {
        const avgFps = samples.reduce((a, b) => a + b, 0) / samples.length;
        const minFps = Math.min(...samples);
        const maxFps = Math.max(...samples);

        resolve({
          average: avgFps,
          min: minFps,
          max: maxFps,
          samples: samples.length
        });
      }
    };

    measureFrame();
  });
}

/**
 * Wait for specified number of game frames
 * @param {Phaser.Scene} scene - Scene instance
 * @param {number} frames - Number of frames to wait
 * @returns {Promise<void>}
 */
export function waitFrames(scene, frames) {
  return new Promise((resolve) => {
    let count = 0;
    const updateHandler = () => {
      count++;
      if (count >= frames) {
        scene.events.off('update', updateHandler);
        resolve();
      }
    };
    scene.events.on('update', updateHandler);
  });
}

/**
 * Simulate key press
 * @param {Phaser.Input.Keyboard.Key} key - Phaser key object
 * @param {number} duration - Hold duration in ms
 * @returns {Promise<void>}
 */
export async function simulateKeyPress(key, duration = 100) {
  key.isDown = true;
  await sleep(duration);
  key.isDown = false;
}

/**
 * Sleep utility for async tests
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Assert entity is within bounds
 * @param {Object} entity - Entity with x, y properties
 * @param {number} minX - Minimum X coordinate
 * @param {number} maxX - Maximum X coordinate
 * @param {number} minY - Minimum Y coordinate
 * @param {number} maxY - Maximum Y coordinate
 * @throws {Error} If entity is out of bounds
 */
export function assertInBounds(entity, minX, maxX, minY, maxY) {
  if (entity.x < minX || entity.x > maxX || entity.y < minY || entity.y > maxY) {
    throw new Error(
      `Entity at (${entity.x}, ${entity.y}) is out of bounds ` +
      `[(${minX}, ${minY}) to (${maxX}, ${maxY})]`
    );
  }
}

/**
 * Calculate distance between two points
 * @param {Object} entity1 - First entity with x, y
 * @param {Object} entity2 - Second entity with x, y
 * @returns {number} Distance in pixels
 */
export function distance(entity1, entity2) {
  const dx = entity1.x - entity2.x;
  const dy = entity1.y - entity2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if two entities are colliding (circle collision)
 * @param {Object} entity1 - First entity with x, y, radius
 * @param {Object} entity2 - Second entity with x, y, radius
 * @returns {boolean} True if colliding
 */
export function isColliding(entity1, entity2) {
  const dist = distance(entity1, entity2);
  const combinedRadius = (entity1.radius || 16) + (entity2.radius || 16);
  return dist < combinedRadius;
}

/**
 * Mock Phaser scene for unit tests
 * @returns {Object} Mock scene object
 */
export function createMockScene() {
  return {
    add: {
      sprite: jest.fn(() => ({})),
      graphics: jest.fn(() => ({})),
      text: jest.fn(() => ({})),
      circle: jest.fn(() => ({}))
    },
    physics: {
      add: {
        sprite: jest.fn(() => ({
          setCollideWorldBounds: jest.fn(),
          setVelocity: jest.fn(),
          body: {}
        }))
      }
    },
    time: {
      addEvent: jest.fn(() => ({}))
    },
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    },
    game: {
      loop: {
        actualFps: 60
      }
    }
  };
}

/**
 * Create mock input handler
 * @returns {Object} Mock input object
 */
export function createMockInput() {
  return {
    keyboard: {
      addKeys: jest.fn(() => ({
        W: { isDown: false },
        A: { isDown: false },
        S: { isDown: false },
        D: { isDown: false },
        SPACE: { isDown: false }
      })),
      createCursorKeys: jest.fn(() => ({
        up: { isDown: false },
        down: { isDown: false },
        left: { isDown: false },
        right: { isDown: false }
      }))
    }
  };
}

/**
 * Assert oxygen is within valid range
 * @param {number} oxygen - Oxygen percentage
 * @throws {Error} If oxygen is invalid
 */
export function assertValidOxygen(oxygen) {
  if (oxygen < 0 || oxygen > 100) {
    throw new Error(`Invalid oxygen value: ${oxygen}. Must be between 0 and 100.`);
  }
}
