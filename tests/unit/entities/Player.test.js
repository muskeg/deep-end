/**
 * Unit Tests for Player Entity
 * TDD: Write tests first, then implement Player class
 */

import { PLAYER_CONFIG, OXYGEN_CONFIG, GAME_CONFIG } from '../../../src/utils/Constants.js';

describe('Player Entity', () => {
  let mockScene;
  let Player;

  beforeEach(async () => {
    // Import Player class (will fail until implemented)
    const module = await import('../../../src/entities/Player.js');
    Player = module.default;

    // Mock Phaser scene
    mockScene = {
      add: {
        sprite: jest.fn(() => ({})),
        existing: jest.fn(),
        graphics: jest.fn(() => ({
          clear: jest.fn(),
          fillStyle: jest.fn(),
          fillCircle: jest.fn()
        }))
      },
      physics: {
        add: {
          sprite: jest.fn(() => ({
            setCollideWorldBounds: jest.fn().mockReturnThis(),
            setVelocity: jest.fn().mockReturnThis(),
            body: {
              velocity: { x: 0, y: 0 },
              setCircle: jest.fn()
            }
          })),
          existing: jest.fn()
        }
      },
      events: {
        emit: jest.fn()
      }
    };
  });

  describe('Initialization', () => {
    test('should create player with correct initial position', () => {
      const player = new Player(mockScene, 100, 200);
      
      expect(player.x).toBe(100);
      expect(player.y).toBe(200);
    });

    test('should initialize with full oxygen', () => {
      const player = new Player(mockScene, 100, 200);
      
      expect(player.oxygen).toBe(PLAYER_CONFIG.INITIAL_OXYGEN);
    });

    test('should initialize with zero score', () => {
      const player = new Player(mockScene, 100, 200);
      
      expect(player.score).toBe(0);
    });

    test('should set circular collision bounds', () => {
      const player = new Player(mockScene, 100, 200);
      
      expect(player.body.setCircle).toHaveBeenCalledWith(PLAYER_CONFIG.COLLISION_RADIUS);
    });

    test('should enable world bounds collision', () => {
      const player = new Player(mockScene, 100, 200);
      
      expect(player.setCollideWorldBounds).toHaveBeenCalledWith(true);
    });
  });

  describe('Movement', () => {
    test('should move right when right input is active', () => {
      const player = new Player(mockScene, 100, 200);
      const input = { left: false, right: true, up: false, down: false };
      
      player.handleMovement(input);
      
      expect(player.body.velocity.x).toBeGreaterThan(0);
    });

    test('should move left when left input is active', () => {
      const player = new Player(mockScene, 100, 200);
      const input = { left: true, right: false, up: false, down: false };
      
      player.handleMovement(input);
      
      expect(player.body.velocity.x).toBeLessThan(0);
    });

    test('should move up when up input is active', () => {
      const player = new Player(mockScene, 100, 200);
      const input = { left: false, right: false, up: true, down: false };
      
      player.handleMovement(input);
      
      expect(player.body.velocity.y).toBeLessThan(0);
    });

    test('should move down when down input is active', () => {
      const player = new Player(mockScene, 100, 200);
      const input = { left: false, right: false, up: false, down: true };
      
      player.handleMovement(input);
      
      expect(player.body.velocity.y).toBeGreaterThan(0);
    });

    test('should stop horizontal movement when no horizontal input', () => {
      const player = new Player(mockScene, 100, 200);
      const input = { left: false, right: false, up: false, down: false };
      
      player.handleMovement(input);
      
      expect(player.body.velocity.x).toBe(0);
    });

    test('should stop vertical movement when no vertical input', () => {
      const player = new Player(mockScene, 100, 200);
      const input = { left: false, right: false, up: false, down: false };
      
      player.handleMovement(input);
      
      expect(player.body.velocity.y).toBe(0);
    });

    test('should move at correct speed', () => {
      const player = new Player(mockScene, 100, 200);
      const input = { left: false, right: true, up: false, down: false };
      
      player.handleMovement(input);
      
      expect(Math.abs(player.body.velocity.x)).toBe(PLAYER_CONFIG.SPEED);
    });

    test('should normalize diagonal movement speed', () => {
      const player = new Player(mockScene, 100, 200);
      const input = { left: false, right: true, up: true, down: false };
      
      player.handleMovement(input);
      
      const magnitude = Math.sqrt(
        player.body.velocity.x ** 2 + player.body.velocity.y ** 2
      );
      expect(magnitude).toBeCloseTo(PLAYER_CONFIG.SPEED, 1);
    });
  });

  describe('Oxygen Management', () => {
    test('should deplete oxygen over time', () => {
      const player = new Player(mockScene, 100, 200);
      const initialOxygen = player.oxygen;
      const deltaSeconds = 1; // 1 second
      
      player.updateOxygen(deltaSeconds);
      
      expect(player.oxygen).toBeLessThan(initialOxygen);
    });

    test('should deplete oxygen at correct base rate', () => {
      const player = new Player(mockScene, 100, 200);
      const deltaSeconds = 1;
      
      player.updateOxygen(deltaSeconds);
      
      const expectedDepletion = OXYGEN_CONFIG.BASE_DEPLETION_RATE * deltaSeconds;
      expect(player.oxygen).toBe(PLAYER_CONFIG.INITIAL_OXYGEN - expectedDepletion);
    });

    test('should not allow oxygen to go below zero', () => {
      const player = new Player(mockScene, 100, 200);
      player.oxygen = 5;
      
      player.updateOxygen(10); // Large delta to force negative
      
      expect(player.oxygen).toBe(0);
    });

    test('should emit oxygen-depleted event when oxygen reaches zero', () => {
      const player = new Player(mockScene, 100, 200);
      player.oxygen = 1;
      
      player.updateOxygen(2);
      
      expect(mockScene.events.emit).toHaveBeenCalledWith('oxygen-depleted');
    });

    test('should emit oxygen-warning event when below threshold', () => {
      const player = new Player(mockScene, 100, 200);
      player.oxygen = OXYGEN_CONFIG.WARNING_THRESHOLD + 5;
      
      player.updateOxygen(10); // Force below threshold
      
      expect(mockScene.events.emit).toHaveBeenCalledWith('oxygen-warning', expect.any(Number));
    });

    test('should take oxygen damage from collision', () => {
      const player = new Player(mockScene, 100, 200);
      const initialOxygen = player.oxygen;
      
      player.takeDamage(OXYGEN_CONFIG.ENEMY_COLLISION_DAMAGE);
      
      expect(player.oxygen).toBe(initialOxygen - OXYGEN_CONFIG.ENEMY_COLLISION_DAMAGE);
    });
  });

  describe('Pearl Collection', () => {
    test('should increase score when collecting pearl', () => {
      const player = new Player(mockScene, 100, 200);
      const pearlValue = 10;
      
      player.collectPearl(pearlValue);
      
      expect(player.score).toBe(pearlValue);
    });

    test('should accumulate score from multiple pearls', () => {
      const player = new Player(mockScene, 100, 200);
      
      player.collectPearl(10);
      player.collectPearl(20);
      player.collectPearl(15);
      
      expect(player.score).toBe(45);
    });

    test('should emit score-changed event on collection', () => {
      const player = new Player(mockScene, 100, 200);
      
      player.collectPearl(10);
      
      expect(mockScene.events.emit).toHaveBeenCalledWith('score-changed', 10);
    });

    test('should track pearl count', () => {
      const player = new Player(mockScene, 100, 200);
      
      player.collectPearl(10);
      player.collectPearl(10);
      
      expect(player.pearlsCollected).toBe(2);
    });
  });

  describe('Interaction', () => {
    test('should detect nearby interactables within radius', () => {
      const player = new Player(mockScene, 100, 100);
      const nearbyObject = { x: 120, y: 100 }; // Within 48px radius
      const farObject = { x: 200, y: 100 }; // Beyond 48px radius
      
      expect(player.canInteractWith(nearbyObject)).toBe(true);
      expect(player.canInteractWith(farObject)).toBe(false);
    });

    test('should use correct interaction radius', () => {
      const player = new Player(mockScene, 100, 100);
      const exactDistanceObject = { 
        x: 100 + PLAYER_CONFIG.INTERACTION_RADIUS, 
        y: 100 
      };
      
      expect(player.canInteractWith(exactDistanceObject)).toBe(true);
    });
  });

  describe('State Management', () => {
    test('should report alive when oxygen > 0', () => {
      const player = new Player(mockScene, 100, 200);
      player.oxygen = 50;
      
      expect(player.isAlive()).toBe(true);
    });

    test('should report dead when oxygen = 0', () => {
      const player = new Player(mockScene, 100, 200);
      player.oxygen = 0;
      
      expect(player.isAlive()).toBe(false);
    });

    test('should be invulnerable after taking damage', () => {
      const player = new Player(mockScene, 100, 200);
      
      player.takeDamage(10);
      
      expect(player.isInvulnerable).toBe(true);
    });

    test('should return to vulnerable state after duration', (done) => {
      const player = new Player(mockScene, 100, 200);
      player.takeDamage(10);
      
      setTimeout(() => {
        expect(player.isInvulnerable).toBe(false);
        done();
      }, 1100); // Slightly more than INVULNERABILITY_DURATION
    });
  });
});
