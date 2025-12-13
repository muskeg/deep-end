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
import OxygenMeter from '../ui/OxygenMeter.js';
import ScoreDisplay from '../ui/ScoreDisplay.js';

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
    
    // Pearl tracking (will be set by generateProceduralCavern)
    this.totalPearls = 0;
    this.collectedPearls = 0;
    
    // Entity arrays
    this.walls = [];
    this.clams = [];
    this.pearls = [];
    this.currents = [];
    this.enemies = [];
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Define world size (3x larger than viewport)
    this.worldWidth = width * 3;
    this.worldHeight = height * 3;
    
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    
    // Fade in effect
    this.cameras.main.fadeIn(500, 0, 0, 0);
    
    // Background (store reference for resize)
    this.background = this.add.rectangle(this.worldWidth / 2, this.worldHeight / 2, this.worldWidth, this.worldHeight, COLORS.WATER);
    
    // Create player at center of world
    this.player = new Player(this, this.worldWidth / 2, this.worldHeight / 2);
    
    // Camera follows player
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    
    // Create input handler
    this.inputHandler = new InputHandler(this);
    
    // Create oxygen system
    this.oxygenSystem = new OxygenSystem(this, this.player);
    
    // Create current system
    this.currentSystem = new CurrentSystem(this, this.player);
    
    // Create collision system
    this.collisionSystem = new CollisionSystem(this, this.player);
    
    // Create UI (fixed to camera, not world)
    this.oxygenMeter = new OxygenMeter(this, width - 220, 16);
    this.oxygenMeter.setScrollFactor(0);
    
    this.scoreDisplay = new ScoreDisplay(this, 16, 16);
    this.scoreDisplay.setScrollFactor(0);
    this.scoreDisplay.updateLevel(this.currentLevel);
    
    // Generate procedural cavern
    this.generateProceduralCavern();
    
    // Update pearl count after cavern generation
    this.scoreDisplay.updatePearlCount(this.collectedPearls, this.totalPearls);
    
    // Setup event listeners
    this.setupEventListeners();
    
    // ESC to return to menu
    this.inputHandler.onPause(() => this.returnToMenu());
    
    // Handle window resize
    this.scale.on('resize', this.resize, this);
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
    
    // Get open positions for entity placement
    const openPositions = generator.getOpenPositions();
    
    // Place player at center first
    const centerX = gridWidth / 2;
    const centerY = gridHeight / 2;
    const startPos = openPositions.find(pos => 
      Math.abs(pos.x - centerX) < 5 && Math.abs(pos.y - centerY) < 5
    ) || openPositions[0];
    
    this.player.setPosition(
      startPos.x * tileSize + tileSize / 2,
      startPos.y * tileSize + tileSize / 2
    );
    
    // Filter positions to only include those far enough from player but not too far
    const minDistance = 10; // At least 10 tiles away
    const maxDistance = Math.min(gridWidth, gridHeight) / 2; // Not too far
    const validPositions = openPositions.filter(pos => {
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist >= minDistance && dist <= maxDistance;
    });
    
    // Shuffle valid positions
    const shuffled = validPositions.sort(() => Math.random() - 0.5);
    
    // Place 3-5 clams
    const clamCount = 3 + Math.floor(this.currentLevel / 2);
    const actualClamCount = Math.min(clamCount, shuffled.length);
    this.totalPearls = actualClamCount;
    this.collectedPearls = 0;
    console.log(`Level ${this.currentLevel}: Generating ${actualClamCount} clams`);
    
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
    
    // Place 2-3 water currents
    const currentCount = 2 + Math.floor(this.currentLevel / 3);
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
    for (let i = clamCount + currentCount; i < clamCount + currentCount + jellyfishCount && i < shuffled.length - 4; i++) {
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
      
      const jellyfish = new Jellyfish(
        this,
        startPos.x * tileSize + tileSize / 2,
        startPos.y * tileSize + tileSize / 2,
        this.player,
        waypoints
      );
      this.enemies.push(jellyfish);
      this.collisionSystem.addEnemy(jellyfish);
    }
    
    // Place 1 eel
    if (this.currentLevel >= 2 && shuffled.length > clamCount + currentCount + jellyfishCount) {
      const eelPos = shuffled[shuffled.length - 1];
      const eel = new Eel(
        this,
        eelPos.x * tileSize + tileSize / 2,
        eelPos.y * tileSize + tileSize / 2,
        this.player,
        { x: eelPos.x * tileSize + tileSize / 2, y: eelPos.y * tileSize + tileSize / 2 }
      );
      this.enemies.push(eel);
      this.collisionSystem.addEnemy(eel);
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
      const clam = new Clam(this, pos.x, pos.y, true);
      this.clams.push(clam);
    });
    
    // Place 2 jellyfish enemies with patrol paths
    const jellyfish1Waypoints = [
      { x: width * 0.2, y: height * 0.2 },
      { x: width * 0.4, y: height * 0.2 },
      { x: width * 0.4, y: height * 0.4 },
      { x: width * 0.2, y: height * 0.4 }
    ];
    const jellyfish1 = new Jellyfish(this, width * 0.2, height * 0.2, this.player, jellyfish1Waypoints);
    this.enemies.push(jellyfish1);
    this.collisionSystem.addEnemy(jellyfish1);
    
    const jellyfish2Waypoints = [
      { x: width * 0.6, y: height * 0.5 },
      { x: width * 0.8, y: height * 0.5 },
      { x: width * 0.8, y: height * 0.7 },
      { x: width * 0.6, y: height * 0.7 }
    ];
    const jellyfish2 = new Jellyfish(this, width * 0.6, height * 0.5, this.player, jellyfish2Waypoints);
    this.enemies.push(jellyfish2);
    this.collisionSystem.addEnemy(jellyfish2);
    
    // Place 1 eel enemy with hiding spot
    const eelHidingPosition = { x: width * 0.1, y: height * 0.9 };
    const eel = new Eel(this, width * 0.1, height * 0.9, this.player, eelHidingPosition);
    this.enemies.push(eel);
    this.collisionSystem.addEnemy(eel);
    
    // Total pearls for tracking
    this.totalPearls = 3;
    this.collectedPearls = 0;
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Pearl collection
    this.events.on('pearl-collected', (value) => {
      this.collectedPearls++;
      console.log(`Pearl collected! Count: ${this.collectedPearls}/${this.totalPearls}`);
      this.scoreDisplay.updatePearlCount(this.collectedPearls, this.totalPearls);
      
      // Check victory condition
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
    });
    
    // Oxygen depleted
    this.events.on('oxygen-depleted', () => {
      this.endGame(false);
    });
    
    // Game over
    this.events.on('game-over', () => {
      this.endGame(false);
    });
  }

  update(time, delta) {
    if (this.gameOver) return;
    
    // Get input
    const input = this.inputHandler.getMovementInput();
    
    // Update player movement
    this.player.handleMovement(input);
    
    // Update oxygen system
    const deltaSeconds = delta / 1000;
    this.oxygenSystem.update(deltaSeconds);
    
    // Update current system
    this.currentSystem.update(deltaSeconds);
    
    // Update collision system (includes enemy collisions)
    this.collisionSystem.update(deltaSeconds);
    
    // Update enemies
    this.enemies.forEach(enemy => {
      if (enemy.active) {
        enemy.update(time, delta);
      }
    });
    
    // Update UI
    this.oxygenMeter.update(this.player.oxygen);
    
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
    
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.GAME_OVER, {
        victory: victory,
        level: this.currentLevel,
        score: this.currentScore
      });
    });
  }
}
