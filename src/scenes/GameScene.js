import Phaser from 'phaser';
import { SCENES, COLORS, GAME_CONFIG } from '../utils/Constants.js';
import Player from '../entities/Player.js';
import Clam from '../entities/Clam.js';
import Wall from '../entities/Wall.js';
import WaterCurrent from '../entities/WaterCurrent.js';
import Enemy from '../entities/Enemy.js';
import Jellyfish from '../entities/Jellyfish.js';
import Eel from '../entities/Eel.js';
import InputHandler from '../utils/InputHandler.js';
import InputSystem from '../systems/InputSystem.js';
import OxygenSystem from '../systems/OxygenSystem.js';
import CurrentSystem from '../systems/CurrentSystem.js';
import CollisionSystem from '../systems/CollisionSystem.js';
import CavernGenerator from '../systems/CavernGenerator.js';
import DifficultySystem from '../systems/DifficultySystem.js';
import DepthZoneSystem from '../systems/DepthZoneSystem.js';
import CombatSystem from '../systems/CombatSystem.js';
import PathfindingSystem from '../systems/PathfindingSystem.js';
import EnemySpawnManager from '../systems/EnemySpawnManager.js';
import ScoreManager from '../utils/ScoreManager.js';
import AudioManager from '../utils/AudioManager.js';
import ProgressionSystem from '../systems/ProgressionSystem.js';
import OxygenMeter from '../ui/OxygenMeter.js';
import DepthMeter from '../ui/DepthMeter.js';
import DashCooldown from '../ui/DashCooldown.js';
import FPSDisplay from '../ui/FPSDisplay.js';

/**
 * GameScene - Main gameplay scene
 * Manages game loop, entities, and systems
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME });
  }

  init(data) {
    // Initialize game state from menu
    this.currentLevel = data.level || 1;
    this.currentScore = data.score || 0;
    this.gameOver = false;
    this.isPaused = false;
    
    // Upgrade parameters from ShopScene
    this.upgradeParams = data.upgradeParams || {
      oxygenMultiplier: 1.0,
      lightMultiplier: 1.0,
      speedMultiplier: 1.0,
      harpoonDamageBonus: 0,
      dashCooldownReduction: 0,
      sonarRangeBonus: 0
    };
    
    // Pearl tracking (will be set by generateProceduralCavern)
    this.totalPearls = 0;
    this.collectedPearls = 0;
    
    // Entity arrays
    this.walls = [];
    this.clams = [];
    this.pearls = [];
    this.currents = [];
    this.enemies = [];
    this.harpoons = []; // Player harpoon projectiles
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Define world size: fixed width for 4K, initially smaller height that expands
    this.worldWidth = 3840; // 4K width (fixed across all devices)
    this.maxWorldHeight = 250000; // Maximum: 2500m (all zones)
    this.chunkHeight = 30000; // Generate in 300m chunks
    this.surfaceOffset = 1000; // Fixed surface offset in pixels (10m)
    
    // Chunk management system
    this.chunkSize = 10000; // 100m chunks - smaller for better performance
    this.chunkCache = new Map(); // Map<chunkIndex, {walls: [], generated: true}>
    this.activeChunks = new Set(); // Currently loaded chunk indices
    this.loadRadius = 3; // Load chunks within 3 chunks of player (300m radius)
    this.worldSeed = this.currentLevel || 1; // Consistent seed for this dive
    this.needsPathfindingRebuild = false; // Throttle pathfinding rebuilds
    this.pathfindingRebuildDelay = 500; // Only rebuild every 500ms
    this.lastPathfindingRebuild = 0;
    
    // Start with enough height to accommodate load radius
    this.worldHeight = this.chunkSize * (this.loadRadius * 2 + 3); // 9 chunks = 900m initial
    this.maxChunkIndex = Math.floor(this.maxWorldHeight / this.chunkSize);
    
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    
    // Store surface height for collision checks
    this.surfaceHeight = height * 0.03;
    
    // Enable Phaser's built-in lighting system
    this.lights.enable();
    this.lights.setAmbientColor(0x4488aa); // Blue-tinted ambient light (sunlight through water)
    
    // Fade in effect
    this.cameras.main.fadeIn(500, 0, 0, 0);
    
    // Create single color background
    this.background = this.add.rectangle(
      this.worldWidth / 2,
      this.worldHeight / 2,
      this.worldWidth,
      this.worldHeight,
      0x003d66 // Single water color
    );
    this.background.setDepth(-2);
    this.background.setPipeline('Light2D'); // Enable lighting on background
    
    // Create depth-based ambient darkness (using Phaser lights)
    this.createDepthDarknessOverlay();
    
    // Add water surface visual (lighter blue line at the top)
    this.waterSurface = this.add.rectangle(
      this.worldWidth / 2, 
      this.surfaceOffset / 2, 
      this.worldWidth, 
      this.surfaceOffset, 
      0x0066aa, // Lighter blue for surface
      0.3 // Semi-transparent
    );
    this.waterSurface.setDepth(-1); // Behind everything except background
    this.waterSurface.setPipeline('Light2D'); // Enable lighting
    
    // Surface line indicator
    this.surfaceLine = this.add.line(
      0, 
      this.surfaceOffset, 
      0, 
      0, 
      this.worldWidth, 
      0, 
      0x00ccff, // Cyan surface line
      0.5
    );
    this.surfaceLine.setOrigin(0, 0);
    this.surfaceLine.setLineWidth(3);
    this.surfaceLine.setDepth(10);
    this.surfaceLine.setPipeline('Light2D'); // Enable lighting
    
    // Create player just below surface
    this.player = new Player(this, this.worldWidth / 2, this.surfaceOffset + 100, this.upgradeParams);
    
    // Camera follows player
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    
    // Create unified input system (handles keyboard, gamepad, and touch)
    this.inputSystem = new InputSystem(this, this.player);
    
    // Create input handler (backwards compatibility)
    this.inputHandler = new InputHandler(this);
    
    // Setup dash callback (harpoon is now handled by InputSystem)
    this.inputHandler.onDash(() => {
      const success = this.player.activateDash();
      if (success && this.dashCooldownUI) {
        this.dashCooldownUI.startCooldown(this.player.dashAbility.cooldown);
      }
    });
    
    // Create score manager
    this.scoreManager = new ScoreManager();
    
    // Create progression system
    this.progressionSystem = new ProgressionSystem();
    
    // Create audio manager
    this.audioManager = new AudioManager(this);
    this.audioManager.initialize();
    
    // Create oxygen system
    this.oxygenSystem = new OxygenSystem(this, this.player);
    
    // Create difficulty system
    this.difficultySystem = new DifficultySystem(this);
    const difficulty = this.difficultySystem.getDifficultyConfig(this.currentLevel);
    
    // Create depth zone system
    this.depthZoneSystem = new DepthZoneSystem(this);
    
    // Create combat system
    this.combatSystem = new CombatSystem(this);
    
    // Create pathfinding system
    this.pathfindingSystem = new PathfindingSystem(this);
    
    // Create enemy spawn manager
    this.enemySpawnManager = new EnemySpawnManager(this);
    
    // Apply oxygen depletion rate from difficulty
    this.oxygenSystem.setDepletionRate(difficulty.oxygenRate);
    
    // Create current system
    this.currentSystem = new CurrentSystem(this, this.player);
    
    // Create collision system
    this.collisionSystem = new CollisionSystem(this, this.player);
    
    // Create UI (fixed to camera, not world)
    this.oxygenMeter = new OxygenMeter(this, width - 220, 16);
    this.oxygenMeter.setScrollFactor(0);
    
    // Dash cooldown UI
    this.dashCooldownUI = new DashCooldown(this, width - 220, 200);
    this.dashCooldownUI.setScrollFactor(0);
    
    // Depth meter UI
    this.depthMeter = new DepthMeter(this, width - 220, 100);
    this.depthMeter.setScrollFactor(0);
    
    // FPS display (toggle with F key)
    this.fpsDisplay = new FPSDisplay(this);
    
    // Generate procedural cavern
    this.generateProceduralCavern();
    
    // Create pause overlay (hidden by default)
    this.createPauseOverlay();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // ESC key to surface voluntarily (roguelike mode)
    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        if (!this.gameOver) {
          console.log('[GameScene] ESC pressed - surfacing voluntarily');
          this.surfaceVoluntarily();
        }
      }
    });
    
    // P key to toggle pause
    this.input.keyboard.on('keydown-P', () => {
      this.togglePause();
    });
    
    // M key to toggle audio
    this.input.keyboard.on('keydown-M', () => {
      const enabled = this.audioManager.toggle();
      console.log(`Audio ${enabled ? 'enabled' : 'muted'}`);
    });

    // DEBUG: I key to dump enemy info
    this.input.keyboard.on('keydown-I', () => {
      const playerDepthM = Math.max(0, (this.player.y - this.surfaceOffset) / 100);
      console.log(`[DEBUG] Player at y=${this.player.y.toFixed(0)} depth=${playerDepthM.toFixed(1)}m | Total enemies: ${this.enemies.length}`);
      this.enemies.forEach((e, i) => {
        const dM = Math.max(0, (e.y - this.surfaceOffset) / 100);
        console.log(`  Enemy ${i}: ${e.constructor.name} pos=(${e.x.toFixed(0)},${e.y.toFixed(0)}) depth=${dM.toFixed(1)}m active=${e.active} visible=${e.visible}`);
      });
      console.log(`[DEBUG] Spawned chunks: ${Array.from(this.enemySpawnManager.spawnedChunks).sort((a,b)=>a-b).join(',')}`);
      console.log(`[DEBUG] Active chunks: ${Array.from(this.activeChunks).sort((a,b)=>a-b).join(',')}`);
    });
    
    // Handle window resize
    this.scale.on('resize', this.resize, this);
  }

  /**
   * Create depth-based darkness overlay (smooth gradient with exponential darkening)
   */
  createDepthDarknessOverlay() {
    // Don't use overlay - use lighting system ambient color changes instead
    // The ambient light will get darker as you go deeper
    
    // Create player light using Phaser's lighting system
    this.createPlayerLight();
  }
  
  /**
   * Create circular light around player using Phaser's lighting system
   */
  createPlayerLight() {
    // Add broad sunlight sources above the scene (outside viewport)
    const surfaceY = -200; // Above the top of the world
    const numSunLights = 3; // Fewer, broader lights
    for (let i = 0; i < numSunLights; i++) {
      const x = (this.worldWidth / numSunLights) * (i + 0.5);
      const sunLight = this.lights.addLight(
        x,
        surfaceY,
        2000 // Very large radius to reach down into scene
      );
      sunLight.setColor(0xaaddff); // Bright blue-white sunlight
      sunLight.setIntensity(2); // Moderate intensity for natural look
    }
    
    // Add point light that follows player (scaled by light upgrade)
    const baseLightRadius = 300;
    const lightRadius = baseLightRadius * (this.upgradeParams.lightMultiplier || 1.0);
    this.playerLight = this.lights.addLight(
      this.worldWidth / 2, 
      this.worldHeight / 2, 
      lightRadius
    );
    this.playerLight.setColor(0xffffcc); // Warm yellow light from player's equipment
    this.playerLight.setIntensity(3); // Higher brightness for equipment light
  }
  
  /**
   * Generate procedural cavern using chunk system
   */
  generateProceduralCavern() {
    const tileSize = GAME_CONFIG.TILE_SIZE;
    const gridWidth = Math.floor(this.worldWidth / tileSize);
    
    // Create invisible walls at water surface to prevent entities from going above
    const surfaceGridY = Math.floor(this.surfaceOffset / tileSize);
    for (let x = 0; x < gridWidth; x++) {
      const surfaceWall = this.add.rectangle(
        x * tileSize + tileSize / 2,
        surfaceGridY * tileSize + tileSize / 2,
        tileSize,
        tileSize,
        0x000000,
        0 // Invisible
      );
      this.physics.add.existing(surfaceWall, true); // true = static body
      this.collisionSystem.addWall(surfaceWall.body);
    }
    
    // Load initial chunks - just enough for immediate area
    const spawnChunkIndex = this.getChunkIndex(this.surfaceOffset + 100);
    console.log(`[Init] Loading initial chunks starting from spawn chunk ${spawnChunkIndex}`);
    
    // Pre-load chunks 0-4 (first 400m)
    for (let i = 0; i <= 4; i++) {
      console.log(`[Init] Loading chunk ${i} (${i * this.chunkSize}px - ${(i + 1) * this.chunkSize}px)`);
      this.loadChunk(i);
    }
    
    console.log(`[Init] Loaded chunks: ${Array.from(this.activeChunks).sort().join(',')}, total walls: ${this.walls.length}, total enemies: ${this.enemies.length}`);
    // Debug: log enemy positions
    this.enemies.forEach((e, i) => {
      const depthM = Math.max(0, (e.y - this.surfaceOffset) / 100);
      console.log(`[Init] Enemy ${i}: type=${e.constructor.name} pos=(${e.x.toFixed(0)}, ${e.y.toFixed(0)}) depth=${depthM.toFixed(1)}m active=${e.active}`);
    });
  }
  
  /**
   * Get chunk index from Y position
   */
  getChunkIndex(y) {
    return Math.floor(y / this.chunkSize);
  }
  
  /**
   * Generate chunk data (cached) - only generates grid data, doesn't create game objects
   */
  generateChunkData(chunkIndex) {
    // Check cache first
    if (this.chunkCache.has(chunkIndex)) {
      return this.chunkCache.get(chunkIndex);
    }
    
    const tileSize = GAME_CONFIG.TILE_SIZE;
    const gridWidth = Math.floor(this.worldWidth / tileSize);
    const chunkHeightTiles = Math.floor(this.chunkSize / tileSize);
    
    // Only chunk 0 has the water surface; no chunk forces a solid bottom
    // (chunks must tile seamlessly)
    const isFirstChunk = chunkIndex === 0;
    
    // Get the last row from the previous chunk for seam continuity
    let topOverlapRow = null;
    if (chunkIndex > 0) {
      const prevChunkData = this.generateChunkData(chunkIndex - 1);
      topOverlapRow = prevChunkData.lastRow;
    }
    
    // Generate cavern chunk with landmark-aware wall densities
    const generator = new CavernGenerator(gridWidth, chunkHeightTiles, 0.30);
    const result = generator.generateWithLandmarks(10, this.worldSeed + chunkIndex * 1000, {
      hasSurface: isFirstChunk,
      hasBottom: false, // Never force solid bottom — chunks must connect
      topOverlapRow: topOverlapRow,
      chunkIndex: chunkIndex
    });
    
    const grid = result.grid;
    const openPositions = result.openPositions;
    const landmarkPositions = result.landmarkPositions || [];
    
    // Store wall positions (not objects yet)
    const wallPositions = [];
    
    for (let y = 0; y < chunkHeightTiles; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (grid[y][x] === 1) {
          wallPositions.push({ x, y: y + chunkIndex * chunkHeightTiles });
        }
      }
    }
    
    // Cache the last row of this chunk's grid for the next chunk's seam blending
    const lastRow = grid[chunkHeightTiles - 1].slice();
    
    // Store chunk data including openPositions for enemy spawning
    const chunkData = { 
      wallPositions, 
      lastRow, 
      openPositions,  // Open positions for spawning
      landmarkPositions, // Open positions within landmark regions (preferred for clams)
      generated: true,
      spawned: false  // Track if enemies already spawned
    };
    this.chunkCache.set(chunkIndex, chunkData);
    return chunkData;
  }
  
  /**
   * Load a chunk (create game objects from cached data)
   */
  loadChunk(chunkIndex) {
    if (this.activeChunks.has(chunkIndex)) return; // Already loaded
    
    const chunkData = this.generateChunkData(chunkIndex);
    const tileSize = GAME_CONFIG.TILE_SIZE;
    
    // Create wall objects in batches to avoid frame drops
    const chunkWalls = [];
    const batchSize = 100; // Process 100 walls at a time
    
    for (let i = 0; i < chunkData.wallPositions.length; i += batchSize) {
      const batch = chunkData.wallPositions.slice(i, i + batchSize);
      for (const pos of batch) {
        const wall = new Wall(this, pos.x, pos.y, tileSize);
        this.walls.push(wall);
        this.collisionSystem.addWall(wall.getBody());
        chunkWalls.push(wall);
      }
    }
    
    // Track active chunk and its walls
    this.activeChunks.add(chunkIndex);
    chunkData.activeWalls = chunkWalls;
    
    // Spawn enemies if this chunk hasn't been spawned yet
    if (!chunkData.spawned && this.enemySpawnManager) {
      this.enemySpawnManager.onChunkLoaded(chunkIndex, chunkData);
      
      // Spawn clams in this chunk (prefer landmark positions)
      this.spawnClamsInChunk(chunkIndex, chunkData);
      
      chunkData.spawned = true;
    }
  }
  
  /**
   * Spawn clams within a chunk, preferring landmark regions.
   * @param {number} chunkIndex - Chunk index
   * @param {Object} chunkData - Chunk data with openPositions and landmarkPositions
   */
  spawnClamsInChunk(chunkIndex, chunkData) {
    const tileSize = GAME_CONFIG.TILE_SIZE;
    const chunkHeightTiles = Math.floor(this.chunkSize / tileSize);
    const surfaceGridY = Math.floor(this.surfaceOffset / tileSize);
    const chunkStartTileY = chunkIndex * chunkHeightTiles;
    
    // Filter positions to only those below the surface
    const filterBelowSurface = (positions) =>
      positions.filter(pos => (pos.y + chunkStartTileY) > surfaceGridY);
    
    const landmarkPos = filterBelowSurface(chunkData.landmarkPositions || []);
    const openPos = filterBelowSurface(chunkData.openPositions || []);
    
    if (openPos.length === 0) return;
    
    // Determine clam count: 1-3 per chunk, more in landmark-rich chunks
    const baseClamCount = landmarkPos.length > 10 ? 3 : 2;
    const clamCount = Math.min(baseClamCount, openPos.length);
    
    // Build spawn pool: 70% from landmark positions, 30% from general positions
    let spawnPool;
    if (landmarkPos.length >= clamCount) {
      // Enough landmark positions — use them preferentially
      const shuffledLandmark = landmarkPos.sort(() => Math.random() - 0.5);
      const shuffledOpen = openPos.sort(() => Math.random() - 0.5);
      // Take from landmarks first, fill remainder from open
      spawnPool = [...shuffledLandmark.slice(0, clamCount)];
      if (spawnPool.length < clamCount) {
        spawnPool.push(...shuffledOpen.slice(0, clamCount - spawnPool.length));
      }
    } else {
      // Not enough landmark positions — use whatever's available
      const shuffled = openPos.sort(() => Math.random() - 0.5);
      spawnPool = shuffled.slice(0, clamCount);
    }
    
    // Spawn clams at chosen positions
    const worldTileY = (localY) => (localY + chunkStartTileY);
    for (const pos of spawnPool) {
      const worldY = worldTileY(pos.y) * tileSize + tileSize / 2;
      const currentZone = this.depthZoneSystem.getCurrentZone(Math.max(0, worldY - this.surfaceOffset));
      const pearlValue = this.depthZoneSystem.getPearlValue(currentZone);
      
      const clam = new Clam(
        this,
        pos.x * tileSize + tileSize / 2,
        worldY,
        true,
        pearlValue
      );
      this.clams.push(clam);
    }
  }
  
  /**
   * Unload a chunk (destroy game objects, keep cached data)
   */
  unloadChunk(chunkIndex) {
    if (!this.activeChunks.has(chunkIndex)) return; // Not loaded
    
    const chunkData = this.chunkCache.get(chunkIndex);
    if (!chunkData || !chunkData.activeWalls) return;
    
    // Destroy wall objects
    for (const wall of chunkData.activeWalls) {
      this.collisionSystem.removeWall(wall.getBody());
      const index = this.walls.indexOf(wall);
      if (index > -1) this.walls.splice(index, 1);
      wall.destroy();
    }
    
    chunkData.activeWalls = null;
    this.activeChunks.delete(chunkIndex);
  }
  
  /**
   * Load chunks around player position (never unload)
   */
  loadChunksAroundPlayer(centerChunkIndex) {
    const chunksToLoad = new Set();
    
    // Load chunks within radius
    for (let offset = -this.loadRadius; offset <= this.loadRadius + 2; offset++) { // +2 for extra buffer ahead
      const chunkIndex = centerChunkIndex + offset;
      if (chunkIndex >= 0 && chunkIndex <= this.maxChunkIndex) {
        chunksToLoad.add(chunkIndex);
      }
    }
    
    // Load new chunks (never unload)
    for (const chunkIndex of chunksToLoad) {
      this.loadChunk(chunkIndex);
    }
    
    // Expand world bounds if needed
    const maxLoadedChunk = Math.max(...this.activeChunks);
    const requiredHeight = (maxLoadedChunk + 2) * this.chunkSize; // +2 for buffer
    if (requiredHeight > this.worldHeight) {
      this.worldHeight = Math.min(requiredHeight, this.maxWorldHeight);
      this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
      this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    }
    
    // Mark that pathfinding needs rebuild (DISABLED for performance)
    // Pathfinding is expensive and enemies use simple movement
    // this.needsPathfindingRebuild = true;
  }
  
  /**
   * Rebuild pathfinding grid from active walls only
   */
  rebuildPathfinding() {
    const wallRects = this.walls.map(wall => ({
      x: wall.x - wall.tileSize / 2,
      y: wall.y - wall.tileSize / 2,
      width: wall.tileSize,
      height: wall.tileSize
    }));
    this.pathfindingSystem.buildGrid(wallRects, this.worldWidth, this.worldHeight);
  }
  
  /**
   * Spawn entities in the game world
   */
  spawnEntities() {
    const tileSize = GAME_CONFIG.TILE_SIZE;
    const gridWidth = Math.floor(this.worldWidth / tileSize);
    const gridHeight = Math.floor(this.worldHeight / tileSize);
    const surfaceGridY = Math.floor(this.surfaceOffset / tileSize);

    // Get open positions for entity placement (skip for now in chunked generation)
    const openPositions = [];
    
    // Filter out positions in surface zone (top 3%)
    const underwaterPositions = openPositions.filter(pos => pos.y > surfaceGridY);
    
    // Place player just below water surface (3% from top)
    const surfaceY = surfaceGridY + 2; // Just below surface
    const centerX = gridWidth / 2;
    const startPos = underwaterPositions.find(pos => 
      Math.abs(pos.x - centerX) < 5 && pos.y >= surfaceY && pos.y < surfaceY + 10
    ) || underwaterPositions.find(pos => pos.y >= surfaceY && pos.y < surfaceY + 10) || underwaterPositions[0];
    
    this.player.setPosition(
      startPos.x * tileSize + tileSize / 2,
      startPos.y * tileSize + tileSize / 2
    );
    
    // Filter positions to only include those far enough from player but not too far
    const minDistance = 10; // At least 10 tiles away
    const maxDistance = Math.min(gridWidth, gridHeight) / 2; // Not too far
    const validPositions = underwaterPositions.filter(pos => {
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist >= minDistance && dist <= maxDistance;
    });
    
    // Shuffle valid positions
    const shuffled = validPositions.sort(() => Math.random() - 0.5);
    
    // Get difficulty-scaled counts
    const difficulty = this.difficultySystem.getDifficultyConfig(this.currentLevel);
    
    // Place clams (difficulty-scaled)
    const actualClamCount = Math.min(difficulty.clams, shuffled.length);
    this.totalPearls = actualClamCount;
    this.collectedPearls = 0;
    console.log(`Level ${this.currentLevel}: Generating ${actualClamCount} clams (difficulty: ${difficulty.clams})`);
    
    for (let i = 0; i < actualClamCount; i++) {
      const pos = shuffled[i];
      const clam = new Clam(
        this,
        pos.x * tileSize + tileSize / 2,
        pos.y * tileSize + tileSize / 2,
        true
      );
      this.clams.push(clam);
    }
    
    // Place water currents (difficulty-scaled)
    const currentCount = difficulty.currents;
    for (let i = actualClamCount; i < actualClamCount + currentCount && i < shuffled.length; i++) {
      const pos = shuffled[i];
      const directions = [
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
        { x: 0.7, y: 0.7 }, { x: -0.7, y: 0.7 }
      ];
      const direction = directions[Math.floor(Math.random() * directions.length)];
      
      const current = new WaterCurrent(
        this,
        pos.x * tileSize,
        pos.y * tileSize,
        tileSize * 3,
        tileSize * 3,
        direction,
        100 + Math.random() * 100
      );
      this.currents.push(current);
      this.currentSystem.addCurrent(current);
    }
    
    // Place 1-2 jellyfish
    const jellyfishCount = 1 + Math.floor(this.currentLevel / 2);
    for (let i = actualClamCount + currentCount; i < actualClamCount + currentCount + jellyfishCount && i < shuffled.length - 4; i++) {
      const startPos = shuffled[i];
      const waypoints = [
        shuffled[i],
        shuffled[i + 1],
        shuffled[i + 2],
        shuffled[i + 3]
      ].map(p => ({
        x: p.x * tileSize + tileSize / 2,
        y: p.y * tileSize + tileSize / 2
      }));
      
      const spawnY = startPos.y * tileSize + tileSize / 2;
      const zoneMultipliers = this.difficultySystem.getZoneDifficulty(spawnY);
      
      const jellyfish = new Jellyfish(
        this,
        startPos.x * tileSize + tileSize / 2,
        spawnY,
        this.player,
        waypoints,
        zoneMultipliers
      );
      this.enemies.push(jellyfish);
      this.collisionSystem.addEnemy(jellyfish);
    }
    
    // Place eels (difficulty-scaled, starts at level 2)
    const eelCount = difficulty.eels;
    if (eelCount > 0 && shuffled.length > actualClamCount + currentCount + jellyfishCount) {
      const eelStartIndex = shuffled.length - eelCount;
      for (let i = 0; i < eelCount; i++) {
        const eelIndex = Math.max(0, eelStartIndex + i);
        if (eelIndex < shuffled.length) {
          const eelPos = shuffled[eelIndex];
          const eelY = eelPos.y * tileSize + tileSize / 2;
          const zoneMultipliers = this.difficultySystem.getZoneDifficulty(eelY);
          
          const eel = new Eel(
            this,
            eelPos.x * tileSize + tileSize / 2,
            eelY,
            this.player,
            { x: eelPos.x * tileSize + tileSize / 2, y: eelY },
            zoneMultipliers
          );
          this.enemies.push(eel);
          this.collisionSystem.addEnemy(eel);
        }
      }
    }
  }

  /**
   * Old static level creation (kept for reference)
   */
  createStaticLevel() {
    const width = this.worldWidth;
    const height = this.worldHeight;
    
    // Place 3 water currents at fixed positions
    const currentConfigs = [
      { x: width * 0.2, y: height * 0.5, width: 120, height: 80, direction: { x: 1, y: 0 }, strength: 120 },
      { x: width * 0.6, y: height * 0.3, width: 100, height: 100, direction: { x: 0, y: 1 }, strength: 100 },
      { x: width * 0.8, y: height * 0.7, width: 90, height: 120, direction: { x: -0.7, y: -0.7 }, strength: 140 }
    ];
    
    currentConfigs.forEach(config => {
      const current = new WaterCurrent(
        this,
        config.x,
        config.y,
        config.width,
        config.height,
        config.direction,
        config.strength
      );
      this.currents.push(current);
      this.currentSystem.addCurrent(current);
    });
    
    // Place 3 clams at fixed positions
    const clamPositions = [
      { x: width * 0.3, y: height * 0.4 },
      { x: width * 0.7, y: height * 0.6 },
      { x: width * 0.5, y: height * 0.8 }
    ];
    
    clamPositions.forEach(pos => {
      // Get zone-based pearl value
      const currentZone = this.depthZoneSystem.getCurrentZone(pos.y);
      const pearlValue = this.depthZoneSystem.getPearlValue(currentZone);
      
      const clam = new Clam(this, pos.x, pos.y, true, pearlValue);
      this.clams.push(clam);
    });
    
    // Place 2 jellyfish enemies with patrol paths
    const jellyfish1Waypoints = [
      { x: width * 0.2, y: height * 0.2 },
      { x: width * 0.4, y: height * 0.2 },
      { x: width * 0.4, y: height * 0.4 },
      { x: width * 0.2, y: height * 0.4 }
    ];
    const jellyY1 = height * 0.2;
    const zoneMultipliers1 = this.difficultySystem.getZoneDifficulty(jellyY1);
    const jellyfish1 = new Jellyfish(this, width * 0.2, jellyY1, this.player, jellyfish1Waypoints, zoneMultipliers1);
    this.enemies.push(jellyfish1);
    this.collisionSystem.addEnemy(jellyfish1);
    
    const jellyfish2Waypoints = [
      { x: width * 0.6, y: height * 0.5 },
      { x: width * 0.8, y: height * 0.5 },
      { x: width * 0.8, y: height * 0.7 },
      { x: width * 0.6, y: height * 0.7 }
    ];
    const jellyY2 = height * 0.5;
    const zoneMultipliers2 = this.difficultySystem.getZoneDifficulty(jellyY2);
    const jellyfish2 = new Jellyfish(this, width * 0.6, jellyY2, this.player, jellyfish2Waypoints, zoneMultipliers2);
    this.enemies.push(jellyfish2);
    this.collisionSystem.addEnemy(jellyfish2);
    
    // Place 1 eel enemy with hiding spot
    const eelHidingPosition = { x: width * 0.1, y: height * 0.9 };
    const eelY = height * 0.9;
    const zoneMultipliers3 = this.difficultySystem.getZoneDifficulty(eelY);
    const eel = new Eel(this, width * 0.1, eelY, this.player, eelHidingPosition, zoneMultipliers3);
    this.enemies.push(eel);
    this.collisionSystem.addEnemy(eel);
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Remove any existing listeners first (prevent duplicates on restart)
    this.events.off('pearl-collected');
    this.events.off('pearl-dispensed');
    this.events.off('oxygen-warning');
    this.events.off('oxygen-depleted');
    this.events.off('game-over');
    
    // Pearl collection
    this.events.on('pearl-collected', (value) => {
      this.collectedPearls++;
      
      // Add pearl to progression system
      this.progressionSystem.addPearls(value || 1);
      
      this.audioManager.playPearlCollect();
      console.log(`Pearl collected! Total pearls: ${this.progressionSystem.getPearls()}`);
    });
    
    // Pearl dispensed from clam
    this.events.on('pearl-dispensed', (pearl) => {
      this.pearls.push(pearl);
      
      // Setup collision with player
      this.physics.add.overlap(this.player, pearl, () => {
        if (!pearl.wasCollected()) {
          pearl.collect();
        }
      });
    });
    
    // Oxygen warnings
    this.events.on('oxygen-warning', () => {
      this.oxygenMeter.showWarning();
      this.audioManager.playOxygenWarning();
    });
    
    // Oxygen depleted
    this.events.on('oxygen-depleted', () => {
      this.endGame(false);
    });
    
    // Zone change event
    this.events.on('zone-changed', (newZone) => {
      console.log(`Entered ${newZone.name}`);
      this.depthMeter.showZoneChange(newZone.name);
      
      // Visual flash effect
      this.cameras.main.flash(500, newZone.ambientColor >> 16 & 0xff, newZone.ambientColor >> 8 & 0xff, newZone.ambientColor & 0xff);
      
      // Audio cue (placeholder - would need actual sound)
      // this.audioManager.playZoneTransition();
    });
    
    // Game over
    this.events.on('game-over', () => {
      this.endGame(false);
    });
  }

  /**
   * Check unsettled clams against walls and settle them on contact.
   * Clams fall with gravity until they touch a wall surface (floor or side),
   * then freeze in place like barnacles.
   */
  settleClamsOnWalls() {
    const tileSize = GAME_CONFIG.TILE_SIZE;
    
    for (const clam of this.clams) {
      if (!clam.active || clam.isSettled) continue;
      
      // Check AABB overlap between clam and nearby walls
      const clamHalfW = 20; // clam collision radius
      const clamHalfH = 20;
      const clamLeft = clam.x - clamHalfW;
      const clamRight = clam.x + clamHalfW;
      const clamTop = clam.y - clamHalfH;
      const clamBottom = clam.y + clamHalfH;
      
      for (const wall of this.walls) {
        const wallHalfW = wall.tileSize / 2;
        const wallHalfH = wall.tileSize / 2;
        const wallLeft = wall.x - wallHalfW;
        const wallRight = wall.x + wallHalfW;
        const wallTop = wall.y - wallHalfH;
        const wallBottom = wall.y + wallHalfH;
        
        // AABB overlap check
        if (clamRight > wallLeft && clamLeft < wallRight &&
            clamBottom > wallTop && clamTop < wallBottom) {
          
          // Determine which side the clam hit and snap to surface
          const overlapBottom = clamBottom - wallTop;
          const overlapTop = wallBottom - clamTop;
          const overlapRight = clamRight - wallLeft;
          const overlapLeft = wallRight - clamLeft;
          
          const minOverlap = Math.min(overlapBottom, overlapTop, overlapRight, overlapLeft);
          
          if (minOverlap === overlapBottom) {
            // Landing on top of wall (floor)
            clam.y = wallTop - clamHalfH;
          } else if (minOverlap === overlapTop) {
            // Hitting bottom of wall (ceiling)
            clam.y = wallBottom + clamHalfH;
          } else if (minOverlap === overlapRight) {
            // Hitting left side of wall
            clam.x = wallLeft - clamHalfW;
          } else {
            // Hitting right side of wall
            clam.x = wallRight + clamHalfW;
          }
          
          clam.settle();
          break;
        }
      }
    }
  }

  update(time, delta) {
    if (this.gameOver || this.isPaused) return;
    
    // Get unified input (keyboard, gamepad, or touch)
    const unifiedInput = this.inputSystem.update(delta);
    
    // Get legacy input for backwards compatibility
    const legacyInput = this.inputHandler.getMovementInput();
    
    // Merge inputs (unified takes priority)
    const input = {
      ...legacyInput,
      ...unifiedInput
    };
    
    // Handle actions from unified input
    if (unifiedInput.harpoon) {
      const harpoon = this.player.fireHarpoon();
      if (harpoon) {
        this.harpoons.push(harpoon);
      }
    }
    
    if (unifiedInput.dash) {
      const success = this.player.activateDash();
      if (success && this.dashCooldownUI) {
        this.dashCooldownUI.startCooldown(this.player.dashAbility.cooldown);
      }
    }
    
    // Update player movement
    this.player.handleMovement(input);
    
    // Proactive world bounds expansion - expand before player hits boundary
    const distanceFromBottom = this.worldHeight - this.player.y;
    const expansionThreshold = this.chunkSize * 2; // Expand when within 200m of bottom
    if (distanceFromBottom < expansionThreshold && this.worldHeight < this.maxWorldHeight) {
      const newHeight = Math.min(this.worldHeight + this.chunkSize * 3, this.maxWorldHeight);
      console.log(`[World] Expanding from ${this.worldHeight}px to ${newHeight}px (player at ${this.player.y}px)`);
      this.worldHeight = newHeight;
      this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
      this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    }
    
    // Spatial chunk loading - check periodically every 30 frames (~0.5 seconds)
    if (!this.chunkLoadCounter) this.chunkLoadCounter = 0;
    this.chunkLoadCounter++;
    
    if (this.chunkLoadCounter >= 30) {
      const currentChunk = this.getChunkIndex(this.player.y);
      this.loadChunksAroundPlayer(currentChunk);
      this.chunkLoadCounter = 0;
    }
    
    // Throttled pathfinding rebuild (DISABLED for performance)
    // if (this.needsPathfindingRebuild && time - this.lastPathfindingRebuild > this.pathfindingRebuildDelay) {
    //   this.rebuildPathfinding();
    //   this.needsPathfindingRebuild = false;
    //   this.lastPathfindingRebuild = time;
    // }
    
    // Update player abilities (dash and harpoon cooldowns)
    this.player.updateAbilities(delta);
    
    // Update dash cooldown UI
    if (this.dashCooldownUI) {
      this.dashCooldownUI.update(delta);
    }
    
    // Update depth zone system (ambient lighting and zone tracking)
    this.depthZoneSystem.updateAmbientLight(this.player.y, this.lights);
    
    // Update oxygen system
    const deltaSeconds = delta / 1000;
    this.oxygenSystem.update(deltaSeconds);
    
    // Update current system
    this.currentSystem.update(deltaSeconds);
    
    // Update collision system (includes enemy collisions)
    this.collisionSystem.update(deltaSeconds);
    
    // Update harpoons (filter to remove inactive ones safely)
    this.harpoons = this.harpoons.filter(harpoon => {
      if (!harpoon.active) return false;
      
      harpoon.update(time, delta);
      
      // Check collision with enemies
      this.enemies.forEach(enemy => {
        if (enemy.active && Phaser.Geom.Intersects.RectangleToRectangle(harpoon.getBounds(), enemy.getBounds())) {
          const damage = harpoon.onEnemyCollision(enemy);
          if (damage > 0) {
            this.combatSystem.dealDamage(enemy, damage);
          }
        }
      });
      
      return harpoon.active; // Keep only if still active after update
    });
    
    // Update enemies
    this.enemies.forEach(enemy => {
      if (enemy.active) {
        enemy.update(time, delta);
      }
    });
    
    // Cull off-screen enemies to maintain performance
    if (this.enemySpawnManager && this.enemies.length > 0) {
      // Run culling every 2 seconds (not every frame)
      if (!this.lastCullTime || time - this.lastCullTime > 2000) {
        this.enemySpawnManager.cullOffScreenEnemies(this.player.y);
        this.lastCullTime = time;
      }
    }
    
    // Update UI
    const oxygenPercent = (this.player.oxygen / this.player.maxOxygen) * 100;
    this.oxygenMeter.update(oxygenPercent);
    this.fpsDisplay.update(time, delta);
    
    // Update depth meter (relative to surface)
    const depthInMeters = Math.max(0, (this.player.y - this.surfaceOffset) / 100);
    this.depthMeter.updateDepth(depthInMeters);
    const currentZone = this.depthZoneSystem.getCurrentZone(this.player.y - this.surfaceOffset);
    this.depthMeter.displayZoneName(currentZone.name);
    
    // Update player visuals
    this.player.update(time, delta);
    
    // Update clams
    this.clams.forEach(clam => clam.update(time, delta));
    
    // Check clam-wall collisions for settling (barnacle physics)
    this.settleClamsOnWalls();
    
    // Update currents
    this.currents.forEach(current => current.update(time, delta));
    
    // Update pearls
    this.pearls.forEach(pearl => {
      if (pearl.active) {
        pearl.update(time, delta);
      }
    });
    
    // Update depth darkness effect to follow camera
    this.updateDepthDarkness();
    
    // Check for clam interaction (E key, gamepad button, or touch button)
    this.checkClamInteraction(unifiedInput.interact);
  }
  
  /**
   * Check if player can interact with nearby clams
   */
  checkClamInteraction(interactPressed) {
    if (!interactPressed) return;
    
    this.clams.forEach(clam => {
      if (clam.canInteract() && this.player.canInteractWith(clam)) {
        clam.open();
        const pearl = clam.dispensePearl();
        // Pearl is automatically added to scene through event listener
      }
    });
  }
  
  /**
   * Update depth darkness effect - move player light to follow player
   */
  updateDepthDarkness() {
    if (this.playerLight && this.player) {
      this.playerLight.setPosition(this.player.x, this.player.y);
    }
  }

  returnToMenu() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.MENU);
    });
  }

  resize(gameSize) {
    // Do not overwrite worldWidth/worldHeight — they are managed by the chunk system.
    // Only reposition UI elements that need to adapt to new viewport size.
    
    if (this.oxygenMeter) {
      this.oxygenMeter.setScrollFactor(0);
    }
    if (this.levelText) {
      this.levelText.setScrollFactor(0);
    }
  }

  endGame(victory) {
    if (this.gameOver) return;
    this.gameOver = true;
    
    // Update statistics
    this.progressionSystem.updateStatistic('totalDeaths', 1);
    
    // Update deepest depth if applicable
    const currentDepth = Math.max(0, (this.player.y - this.surfaceOffset) / 100); // Convert pixels to meters (relative to surface)
    if (currentDepth > this.progressionSystem.getStatistics().deepestDepthReached) {
      this.progressionSystem.updateStatistic('deepestDepthReached', currentDepth, true);
    }
    
    console.log(`Dive ended: ${victory ? 'Victory!' : 'Oxygen depleted'}`);
    
    // Play appropriate audio
    if (victory) {
      this.audioManager.playLevelComplete();
    } else {
      this.audioManager.playGameOver();
    }
    
    // Fade to shop scene
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.SHOP);
    });
  }

  /**
   * Surface voluntarily (ESC key) - return to shop keeping pearls
   */
  surfaceVoluntarily() {
    if (this.gameOver) return;
    this.gameOver = true;
    
    // Update statistics
    const currentDepth = Math.max(0, (this.player.y - this.surfaceOffset) / 100);
    if (currentDepth > this.progressionSystem.getStatistics().deepestDepthReached) {
      this.progressionSystem.updateStatistic('deepestDepthReached', currentDepth, true);
    }
    
    console.log('[GameScene] Surfacing voluntarily - returning to shop');
    
    // Play victory audio for successful escape
    this.audioManager.playLevelComplete();
    
    // Fade to shop scene
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.SHOP);
    });
  }

  /**
   * Create pause overlay UI
   */
  createPauseOverlay() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Semi-transparent overlay
    this.pauseOverlay = this.add.rectangle(
      width / 2, 
      height / 2, 
      width, 
      height, 
      0x000000, 
      0.7
    );
    this.pauseOverlay.setScrollFactor(0);
    this.pauseOverlay.setDepth(2000);
    this.pauseOverlay.setVisible(false);
    
    // "PAUSED" text
    this.pauseText = this.add.text(width / 2, height / 2 - 40, 'PAUSED', {
      font: 'bold 64px monospace',
      fill: '#00ccff',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.pauseText.setOrigin(0.5);
    this.pauseText.setScrollFactor(0);
    this.pauseText.setDepth(2001);
    this.pauseText.setVisible(false);
    
    // Resume instructions
    this.pauseInstructions = this.add.text(width / 2, height / 2 + 40, 'Press ESC to resume', {
      font: '24px monospace',
      fill: '#ffffff'
    });
    this.pauseInstructions.setOrigin(0.5);
    this.pauseInstructions.setScrollFactor(0);
    this.pauseInstructions.setDepth(2001);
    this.pauseInstructions.setVisible(false);
  }

  /**
   * Toggle pause state
   */
  togglePause() {
    if (this.gameOver) return;
    
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      // Pause the game
      this.physics.pause();
      this.pauseOverlay.setVisible(true);
      this.pauseText.setVisible(true);
      this.pauseInstructions.setVisible(true);
    } else {
      // Resume the game
      this.physics.resume();
      this.pauseOverlay.setVisible(false);
      this.pauseText.setVisible(false);
      this.pauseInstructions.setVisible(false);
    }
  }
}
