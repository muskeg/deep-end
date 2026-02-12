import SpawnValidator from './SpawnValidator.js';
import Jellyfish from '../entities/Jellyfish.js';
import Eel from '../entities/Eel.js';
import Enemy from '../entities/Enemy.js';

/**
 * EnemySpawnManager
 * Manages enemy lifecycle: spawning, population limits, culling
 * Integrates with chunk loading system for continuous spawning
 */
export default class EnemySpawnManager {
  constructor(scene) {
    this.scene = scene;
    this.validator = new SpawnValidator();
    
    // Track spawned chunks to prevent duplicate spawning
    this.spawnedChunks = new Set();
    
    // Enemy type class mappings
    this.enemyClasses = {
      'jellyfish': Jellyfish,
      'eel': Eel,
      'squid': Enemy, // Fallback to base Enemy for now
      'anglerfish': Enemy // Fallback to base Enemy for now
    };
    
    // Performance settings
    this.MAX_SPAWNS_PER_FRAME = 3; // Limit spawn batches per frame
    this.OFF_SCREEN_DISTANCE = 2000; // Distance to consider enemy off-screen (px)
    
    // Metrics for debugging
    this.metrics = {
      totalSpawned: 0,
      totalCulled: 0,
      spawnTime: 0
    };
  }

  /**
   * Called when a chunk is loaded around the player
   * @param {number} chunkIndex - Index of the loaded chunk
   * @param {Object} chunkData - Chunk data including openPositions
   */
  onChunkLoaded(chunkIndex, chunkData) {
    // Skip if chunk already spawned
    if (this.spawnedChunks.has(chunkIndex)) return;
    
    // Skip if no open positions available
    if (!chunkData.openPositions || chunkData.openPositions.length === 0) {
      console.warn(`[EnemySpawnManager] Chunk ${chunkIndex} has no open positions`);
      this.spawnedChunks.add(chunkIndex);
      return;
    }
    
    const startTime = performance.now();
    
    // Determine current depth zone (use surface-relative depth)
    const chunkY = chunkIndex * this.scene.chunkSize;
    const surfaceOffset = this.scene.surfaceOffset || 0;
    const depth = Math.max(0, chunkY - surfaceOffset);
    
    // Filter out positions above the surface level
    // surfaceOffset is in pixels, convert to local grid tiles for this chunk
    const tileSize = 50;
    const surfaceGridY = Math.floor(surfaceOffset / tileSize);
    const chunkStartTileY = chunkIndex * Math.floor(this.scene.chunkSize / tileSize);
    // Only positions whose world tile Y is below the surface are valid
    const filteredPositions = chunkData.openPositions.filter(pos => {
      const worldTileY = pos.y + chunkStartTileY;
      return worldTileY > surfaceGridY;
    });
    
    if (filteredPositions.length === 0) {
      this.spawnedChunks.add(chunkIndex);
      return;
    }
    const zone = this.scene.depthZoneSystem.getCurrentZone(depth);
    
    // Check if we can spawn more enemies in this zone
    if (!this.canSpawnInZone(zone)) {
      console.log(`[EnemySpawnManager] Zone ${zone.name} at max capacity, culling before spawn`);
      this.cullOffScreenEnemies(this.scene.player.y);
    }
    
    // Calculate spawn count from filtered positions
    const spawnCount = this.calculateSpawnCount(zone, filteredPositions.length);
    
    // Spawn enemies using filtered positions (no surface spawns)
    const spawned = this.spawnEnemiesInChunk(chunkIndex, { ...chunkData, openPositions: filteredPositions }, zone, spawnCount);
    
    // Mark chunk as spawned
    this.spawnedChunks.add(chunkIndex);
    
    // Update metrics
    const elapsed = performance.now() - startTime;
    this.metrics.spawnTime += elapsed;
    this.metrics.totalSpawned += spawned;
    
    console.log(`[EnemySpawnManager] Chunk ${chunkIndex}: spawned=${spawned} zone=${zone.name} depthPx=${depth} depthM=${depth/100} filteredPos=${filteredPositions.length} spawnCount=${spawnCount} (${elapsed.toFixed(2)}ms)`);
  }

  /**
   * Calculate number of enemies to spawn
   * @param {Object} zone - Current depth zone
   * @param {number} openArea - Number of open positions
   * @returns {number} Spawn count
   */
  calculateSpawnCount(zone, openArea) {
    // Formula: openArea × enemySpawnRate × randomMultiplier(2.0-5.0)
    const spawnRate = zone.enemySpawnRate || 0.01;
    const randomMultiplier = 2.0 + Math.random() * 3.0; // 2.0 to 5.0
    const count = Math.floor(openArea * spawnRate * randomMultiplier);
    
    // Clamp to reasonable range
    return Math.max(1, Math.min(count, 10));
  }

  /**
   * Select random enemy type from zone configuration
   * @param {Object} zone - Current depth zone
   * @returns {string} Enemy type name
   */
  selectEnemyType(zone) {
    if (!zone.enemyTypes || zone.enemyTypes.length === 0) {
      console.warn(`[EnemySpawnManager] Zone ${zone.name} has no enemy types, using jellyfish`);
      return 'jellyfish';
    }
    
    // Random selection with equal probability
    const randomIndex = Math.floor(Math.random() * zone.enemyTypes.length);
    return zone.enemyTypes[randomIndex];
  }

  /**
   * Spawn a single enemy at position
   * @param {string} type - Enemy type name
   * @param {Object} position - Position {x, y} in pixels
   * @param {Object} zone - Current depth zone
   * @returns {Object|null} Spawned enemy or null
   */
  spawnEnemy(type, position, zone) {
    try {
      const EnemyClass = this.enemyClasses[type];
      
      if (!EnemyClass) {
        console.error(`[EnemySpawnManager] Unknown enemy type: ${type}, using basic Enemy`);
        const enemy = new Enemy(this.scene, position.x, position.y, 'enemy', this.scene.player);
        enemy.spawnTimestamp = Date.now();
        return enemy;
      }
      
      // Create enemy with timestamp for culling
      let enemy;
      if (type === 'jellyfish') {
        enemy = new EnemyClass(this.scene, position.x, position.y, this.scene.player);
      } else if (type === 'eel') {
        enemy = new EnemyClass(this.scene, position.x, position.y, this.scene.player);
      } else {
        enemy = new Enemy(this.scene, position.x, position.y, 'enemy', this.scene.player);
      }
      
      enemy.spawnTimestamp = Date.now();
      return enemy;
    } catch (e) {
      console.error(`[EnemySpawnManager] Failed to create ${type} at (${position.x}, ${position.y}):`, e);
      return null;
    }
  }

  /**
   * Spawn multiple enemies in a chunk
   * @param {number} chunkIndex - Chunk index
   * @param {Object} chunkData - Chunk data with openPositions
   * @param {Object} zone - Current depth zone
   * @param {number} count - Number to spawn
   * @returns {number} Number actually spawned
   */
  spawnEnemiesInChunk(chunkIndex, chunkData, zone, count) {
    let spawned = 0;
    const tileSize = 50;
    
    // Calculate chunk world offset (openPositions are in local grid coords)
    const chunkWorldOffsetY = chunkIndex * this.scene.chunkSize;
    
    // Get wallGrid for validation (reconstruct from chunk data)
    let wallGrid;
    try {
      wallGrid = this.reconstructWallGrid(chunkData, chunkIndex);
    } catch (e) {
      console.error(`[EnemySpawnManager] wallGrid reconstruction failed for chunk ${chunkIndex}:`, e);
      wallGrid = null;
    }
    
    // Convert player position to local chunk space for validation
    const playerLocalY = this.scene.player.y - chunkWorldOffsetY;
    
    // Pre-shuffle positions once for the whole chunk (more efficient)
    const shuffled = [...chunkData.openPositions].sort(() => Math.random() - 0.5);
    let posIndex = 0; // Track which position to try next for fallback
    
    for (let i = 0; i < count; i++) {
      try {
        // Select enemy type
        const type = this.selectEnemyType(zone);
        
        // Try validator first (if wallGrid is available)
        let localPosition = null;
        if (wallGrid) {
          localPosition = this.validator.getRandomValidPosition(
            chunkData.openPositions,
            wallGrid,
            { x: this.scene.player.x, y: playerLocalY }
          );
        }
        
        // Fallback: pick directly from shuffled open positions
        if (!localPosition) {
          while (posIndex < shuffled.length) {
            const pos = shuffled[posIndex++];
            const pixelX = pos.x * tileSize + tileSize / 2;
            const pixelY = pos.y * tileSize + tileSize / 2;
            // Basic player distance check only (skip if within 400px)
            const distToPlayer = Math.hypot(pixelX - this.scene.player.x, pixelY - playerLocalY);
            if (distToPlayer >= 400) {
              localPosition = { x: pixelX, y: pixelY };
              break;
            }
          }
        }
        
        if (!localPosition) {
          console.warn(`[EnemySpawnManager] No position found for enemy ${i + 1}/${count} in chunk ${chunkIndex} (exhausted ${shuffled.length} positions)`);
          continue;
        }
        
        // Convert to world-space position by adding chunk offset
        const worldPosition = {
          x: localPosition.x,
          y: localPosition.y + chunkWorldOffsetY
        };
        
        // Spawn enemy at world position
        const enemy = this.spawnEnemy(type, worldPosition, zone);
        
        if (enemy) {
          // Add to scene enemies array
          if (!this.scene.enemies) this.scene.enemies = [];
          this.scene.enemies.push(enemy);
          
          // Add to collision system
          if (this.scene.collisionSystem) {
            this.scene.collisionSystem.addEnemy(enemy);
          }
          
          spawned++;
        } else {
          console.error(`[EnemySpawnManager] spawnEnemy returned null for ${type} at chunk ${chunkIndex}`);
        }
      } catch (e) {
        console.error(`[EnemySpawnManager] Error spawning enemy ${i + 1}/${count} in chunk ${chunkIndex}:`, e);
      }
    }
    
    return spawned;
  }

  /**
   * Reconstruct wall grid from chunk data for validation
   * @param {Object} chunkData - Chunk data
   * @param {number} chunkIndex - Chunk index
   * @returns {Array<Array<number>>} 2D wall grid
   */
  reconstructWallGrid(chunkData, chunkIndex) {
    const tileSize = 50;
    const gridWidth = Math.floor(this.scene.worldWidth / tileSize);
    const chunkHeightTiles = Math.floor(this.scene.chunkSize / tileSize);
    
    // Initialize empty grid
    const grid = [];
    for (let y = 0; y < chunkHeightTiles; y++) {
      grid[y] = new Array(gridWidth).fill(0);
    }
    
    // Fill in walls from positions
    for (const pos of chunkData.wallPositions) {
      const localY = pos.y - (chunkIndex * chunkHeightTiles);
      if (localY >= 0 && localY < chunkHeightTiles) {
        grid[localY][pos.x] = 1;
      }
    }
    
    return grid;
  }

  /**
   * Check if we can spawn more enemies in this zone
   * @param {Object} zone - Depth zone
   * @returns {boolean} True if can spawn
   */
  canSpawnInZone(zone) {
    const activeCount = this.getActiveEnemyCount(zone);
    const maxEnemies = zone.maxEnemies || 10;
    return activeCount < maxEnemies;
  }

  /**
   * Get count of active enemies in zone
   * @param {Object} zone - Depth zone
   * @returns {number} Count
   */
  getActiveEnemyCount(zone) {
    if (!this.scene.enemies) return 0;
    
    const surfaceOffset = this.scene.surfaceOffset || 0;
    return this.scene.enemies.filter(enemy => {
      if (!enemy.active) return false;
      const depth = Math.max(0, enemy.y - surfaceOffset);
      const enemyZone = this.scene.depthZoneSystem.getCurrentZone(depth);
      return enemyZone.name === zone.name;
    }).length;
  }

  /**
   * Cull off-screen enemies ONLY when total population exceeds global limit.
   * This prevents enemies from vanishing when the player simply moves away.
   * @param {number} playerY - Player Y position
   */
  cullOffScreenEnemies(playerY) {
    if (!this.scene.enemies) return;
    
    // Only cull when we have too many active enemies globally
    const activeCount = this.scene.enemies.filter(e => e.active).length;
    const globalLimit = 50; // Max active enemies across all zones
    if (activeCount <= globalLimit) return;
    
    // Find off-screen enemies (far from player)
    const offScreenEnemies = this.scene.enemies
      .filter(enemy => enemy.active)
      .map(enemy => ({
        enemy,
        distance: Math.abs(enemy.y - playerY),
        age: Date.now() - (enemy.spawnTimestamp || 0)
      }))
      .filter(data => data.distance > this.OFF_SCREEN_DISTANCE)
      .sort((a, b) => b.age - a.age); // Oldest first
    
    // Only cull enough to get back under the limit
    const excessCount = activeCount - globalLimit;
    const cullCount = Math.min(excessCount, offScreenEnemies.length);
    if (cullCount <= 0) return;
    
    for (let i = 0; i < cullCount; i++) {
      const { enemy } = offScreenEnemies[i];
      
      // Remove from collision system
      if (this.scene.collisionSystem) {
        this.scene.collisionSystem.removeEnemy(enemy);
      }
      
      // Remove from enemies array
      const index = this.scene.enemies.indexOf(enemy);
      if (index > -1) {
        this.scene.enemies.splice(index, 1);
      }
      
      // Destroy enemy
      enemy.destroy();
      
      this.metrics.totalCulled++;
    }
    
    if (cullCount > 0) {
      console.log(`[EnemySpawnManager] Culled ${cullCount} off-screen enemies`);
    }
  }

  /**
   * Get performance metrics
   * @returns {Object} Metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }
}
