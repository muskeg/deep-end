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
import OxygenSystem from '../systems/OxygenSystem.js';
import CurrentSystem from '../systems/CurrentSystem.js';
import CollisionSystem from '../systems/CollisionSystem.js';
import CavernGenerator from '../systems/CavernGenerator.js';
import DifficultySystem from '../systems/DifficultySystem.js';
import DepthZoneSystem from '../systems/DepthZoneSystem.js';
import CombatSystem from '../systems/CombatSystem.js';
import PathfindingSystem from '../systems/PathfindingSystem.js';
import ScoreManager from '../utils/ScoreManager.js';
import AudioManager from '../utils/AudioManager.js';
import ProgressionSystem from '../systems/ProgressionSystem.js';
import OxygenMeter from '../ui/OxygenMeter.js';
import ScoreDisplay from '../ui/ScoreDisplay.js';
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
    
    // Define world size: fixed width for 4K, 10x deeper vertically
    this.worldWidth = 3840; // 4K width (fixed across all devices)
    this.worldHeight = height * 10; // 10x deeper than viewport
    
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
    const surfaceHeight = this.worldHeight * 0.03;
    this.waterSurface = this.add.rectangle(
      this.worldWidth / 2, 
      surfaceHeight / 2, 
      this.worldWidth, 
      surfaceHeight, 
      0x0066aa, // Lighter blue for surface
      0.3 // Semi-transparent
    );
    this.waterSurface.setDepth(-1); // Behind everything except background
    this.waterSurface.setPipeline('Light2D'); // Enable lighting
    
    // Surface line indicator
    this.surfaceLine = this.add.line(
      0, 
      surfaceHeight, 
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
    
    // Create player at center of world with upgrade parameters
    this.player = new Player(this, this.worldWidth / 2, this.worldHeight / 2, this.upgradeParams);
    
    // Camera follows player
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    
    // Create input handler
    this.inputHandler = new InputHandler(this);
    
    // Setup combat input callbacks
    this.inputHandler.onAttack(() => {
      const harpoon = this.player.fireHarpoon();
      if (harpoon) {
        this.harpoons.push(harpoon);
      }
    });
    
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
    
    // Apply oxygen depletion rate from difficulty
    this.oxygenSystem.setDepletionRate(difficulty.oxygenRate);
    
    // Create current system
    this.currentSystem = new CurrentSystem(this, this.player);
    
    // Create collision system
    this.collisionSystem = new CollisionSystem(this, this.player);
    
    // Create UI (fixed to camera, not world)
    this.oxygenMeter = new OxygenMeter(this, width - 220, 16);
    this.oxygenMeter.setScrollFactor(0);
    
    this.scoreDisplay = new ScoreDisplay(this, 16, 16);
    this.scoreDisplay.setScrollFactor(0);
    
    // Dash cooldown UI
    this.dashCooldownUI = new DashCooldown(this, width - 220, 200);
    this.dashCooldownUI.setScrollFactor(0);
    this.scoreDisplay.updateLevel(this.currentLevel);
    
    // Depth meter UI
    this.depthMeter = new DepthMeter(this, width - 220, 100);
    this.depthMeter.setScrollFactor(0);
    
    // FPS display (toggle with F key)
    this.fpsDisplay = new FPSDisplay(this);
    
    // Generate procedural cavern
    this.generateProceduralCavern();
    
    // Update pearl count after cavern generation
    this.scoreDisplay.updatePearlCount(this.collectedPearls, this.totalPearls);
    
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
    
    // M key to toggle audio
    this.input.keyboard.on('keydown-M', () => {
      const enabled = this.audioManager.toggle();
      console.log(`Audio ${enabled ? 'enabled' : 'muted'}`);
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
    
    // Add point light that follows player
    this.playerLight = this.lights.addLight(
      this.worldWidth / 2, 
      this.worldHeight / 2, 
      300 // Light radius - increased for better visibility
    );
    this.playerLight.setColor(0xffffcc); // Warm yellow light from player's equipment
    this.playerLight.setIntensity(3); // Higher brightness for equipment light
  }
  
  /**
   * Generate procedural cavern using Cellular Automata
   */
  generateProceduralCavern() {
    const tileSize = GAME_CONFIG.TILE_SIZE;
    const gridWidth = Math.floor(this.worldWidth / tileSize);
    const gridHeight = Math.floor(this.worldHeight / tileSize);
    
    // Generate cavern
    const generator = new CavernGenerator(gridWidth, gridHeight);
    const grid = generator.generate(10, this.currentLevel); // Use level as seed
    
    // Create walls from grid
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (grid[y][x] === 1) {
          const wall = new Wall(this, x, y, tileSize);
          this.walls.push(wall);
          this.collisionSystem.addWall(wall.getBody());
        }
      }
    }
    
    // Build pathfinding grid from walls
    const wallRects = this.walls.map(wall => ({
      x: wall.x - wall.tileSize / 2,
      y: wall.y - wall.tileSize / 2,
      width: wall.tileSize,
      height: wall.tileSize
    }));
    this.pathfindingSystem.buildGrid(wallRects, this.worldWidth, this.worldHeight);
    
    // Create invisible walls at water surface to prevent entities from going above
    const surfaceGridY = Math.floor(gridHeight * 0.03);
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
    
    // Get open positions for entity placement
    const openPositions = generator.getOpenPositions();
    
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
      console.log(`Pearl collected! Count: ${this.collectedPearls}/${this.totalPearls}`);
      this.scoreDisplay.updatePearlCount(this.collectedPearls, this.totalPearls);
      
      // Check victory condition (optional in roguelike mode)
      if (this.collectedPearls >= this.totalPearls) {
        console.log('Victory! All pearls collected.');
        this.endGame(true);
      }
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

  update(time, delta) {
    if (this.gameOver || this.isPaused) return;
    
    // Get input
    const input = this.inputHandler.getMovementInput();
    
    // Update player movement
    this.player.handleMovement(input);
    
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
    
    // Update harpoons
    this.harpoons.forEach((harpoon, index) => {
      if (harpoon.active) {
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
      } else {
        // Remove inactive harpoons
        this.harpoons.splice(index, 1);
      }
    });
    
    // Update enemies
    this.enemies.forEach(enemy => {
      if (enemy.active) {
        enemy.update(time, delta);
      }
    });
    
    // Update UI
    this.oxygenMeter.update(this.player.oxygen);
    this.fpsDisplay.update(time, delta);
    
    // Update depth meter
    const depthInMeters = this.player.y / 100;
    this.depthMeter.updateDepth(depthInMeters);
    const currentZone = this.depthZoneSystem.getCurrentZone(this.player.y);
    this.depthMeter.displayZoneName(currentZone.name);
    
    // Update player visuals
    this.player.update(time, delta);
    
    // Update clams
    this.clams.forEach(clam => clam.update(time, delta));
    
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
    
    // Check for clam interaction
    if (this.inputHandler.isInteractJustPressed()) {
      this.checkClamInteraction();
    }
  }
  
  /**
   * Check if player can interact with nearby clams
   */
  checkClamInteraction() {
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
    const width = gameSize.width;
    const height = gameSize.height;
    
    // Update world size to be 3x viewport
    this.worldWidth = width * 3;
    this.worldHeight = height * 3;
    
    // Update background size
    if (this.background) {
      this.background.setSize(this.worldWidth, this.worldHeight);
      this.background.setPosition(this.worldWidth / 2, this.worldHeight / 2);
    }
    
    // Update camera and physics bounds
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    
    // Update UI positions (UI stays fixed to camera)
    if (this.oxygenMeter) {
      this.oxygenMeter.setScrollFactor(0);
    }
    if (this.scoreDisplay) {
      this.scoreDisplay.setScrollFactor(0);
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
    const currentDepth = this.player.y / 100; // Convert pixels to meters (approximate)
    if (currentDepth > this.progressionSystem.getStatistics().deepestDepthReached) {
      this.progressionSystem.updateStatistic('deepestDepthReached', currentDepth, true);
    }
    
    console.log(`Dive ended: ${victory ? 'Victory!' : 'Oxygen depleted'}`);
    
    // Roguelike mode: always return to shop (keep pearls)
    this.audioManager.playGameOver();
    
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
    const currentDepth = this.player.y / 100;
    if (currentDepth > this.progressionSystem.getStatistics().deepestDepthReached) {
      this.progressionSystem.updateStatistic('deepestDepthReached', currentDepth, true);
    }
    
    console.log('[GameScene] Surfacing voluntarily - returning to shop');
    
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
