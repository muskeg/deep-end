/**
 * Unit Tests for Enemy Base Class
 * TDD: Write tests first, then implement Enemy class
 */

import { ENEMY_CONFIG } from '../../../src/utils/Constants.js';

describe('Enemy Base Class', () => {
  let mockScene;
  let mockPlayer;
  let Enemy;

  beforeEach(async () => {
    const module = await import('../../../src/entities/Enemy.js');
    Enemy = module.default;

    mockPlayer = {
      x: 400,
      y: 300,
      body: { velocity: { x: 0, y: 0 } }
    };

    mockScene = {
      add: {
        sprite: jest.fn(() => ({})),
        existing: jest.fn(),
        graphics: jest.fn(() => ({
          clear: jest.fn(),
          fillStyle: jest.fn(),
          fillCircle: jest.fn(),
          lineStyle: jest.fn(),
          strokeCircle: jest.fn(),
          destroy: jest.fn()
        }))
      },
      physics: {
        add: {
          sprite: jest.fn(() => ({
            body: {
              setCircle: jest.fn()
            }
          })),
          existing: jest.fn()
        }
      },
      time: {
        now: 1000,
        addEvent: jest.fn()
      },
      events: {
        emit: jest.fn()
      }
    };
  });

  describe('Initialization', () => {
    test('should create enemy at correct position', () => {
      const enemy = new Enemy(mockScene, 200, 300, mockPlayer);
      
      expect(enemy.x).toBe(200);
      expect(enemy.y).toBe(300);
    });

    test('should have default detection radius', () => {
      const enemy = new Enemy(mockScene, 200, 300, mockPlayer);
      
      expect(enemy.detectionRadius).toBe(200);
    });

    test('should accept custom detection radius', () => {
      const enemy = new Enemy(mockScene, 200, 300, mockPlayer, 300);
      
      expect(enemy.detectionRadius).toBe(300);
    });

    test('should initialize with no target', () => {
      const enemy = new Enemy(mockScene, 200, 300, mockPlayer);
      
      expect(enemy.hasTarget).toBe(false);
    });

    test('should store player reference', () => {
      const enemy = new Enemy(mockScene, 200, 300, mockPlayer);
      
      expect(enemy.player).toBe(mockPlayer);
    });

    test('should initialize attack cooldown', () => {
      const enemy = new Enemy(mockScene, 200, 300, mockPlayer);
      
      expect(enemy.attackCooldown).toBeDefined();
      expect(enemy.lastAttackTime).toBe(0);
    });
  });

  describe('Player Detection', () => {
    test('should detect player within radius', () => {
      const enemy = new Enemy(mockScene, 400, 300, mockPlayer, 200);
      mockPlayer.x = 450;
      mockPlayer.y = 300;
      
      expect(enemy.canDetectPlayer()).toBe(true);
    });

    test('should not detect player outside radius', () => {
      const enemy = new Enemy(mockScene, 100, 100, mockPlayer, 200);
      mockPlayer.x = 400;
      mockPlayer.y = 400;
      
      expect(enemy.canDetectPlayer()).toBe(false);
    });

    test('should detect player at edge of radius', () => {
      const enemy = new Enemy(mockScene, 400, 300, mockPlayer, 100);
      mockPlayer.x = 500;
      mockPlayer.y = 300;
      
      expect(enemy.canDetectPlayer()).toBe(true);
    });

    test('should calculate distance to player', () => {
      const enemy = new Enemy(mockScene, 0, 0, mockPlayer, 200);
      mockPlayer.x = 3;
      mockPlayer.y = 4;
      
      expect(enemy.getDistanceToPlayer()).toBe(5);
    });
  });

  describe('Target Acquisition', () => {
    test('should acquire target when player detected', () => {
      const enemy = new Enemy(mockScene, 400, 300, mockPlayer, 200);
      mockPlayer.x = 450;
      mockPlayer.y = 300;
      
      enemy.update(0, 16);
      
      expect(enemy.hasTarget).toBe(true);
    });

    test('should not acquire target when player too far', () => {
      const enemy = new Enemy(mockScene, 100, 100, mockPlayer, 200);
      mockPlayer.x = 400;
      mockPlayer.y = 400;
      
      enemy.update(0, 16);
      
      expect(enemy.hasTarget).toBe(false);
    });

    test('should lose target when player leaves radius', () => {
      const enemy = new Enemy(mockScene, 400, 300, mockPlayer, 200);
      mockPlayer.x = 450;
      mockPlayer.y = 300;
      
      enemy.update(0, 16); // Acquire target
      expect(enemy.hasTarget).toBe(true);
      
      mockPlayer.x = 700;
      enemy.update(0, 16); // Lose target
      
      expect(enemy.hasTarget).toBe(false);
    });

    test('should emit target-acquired event', () => {
      const enemy = new Enemy(mockScene, 400, 300, mockPlayer, 200);
      mockPlayer.x = 450;
      mockPlayer.y = 300;
      
      enemy.update(0, 16);
      
      expect(mockScene.events.emit).toHaveBeenCalledWith('enemy-target-acquired', enemy);
    });

    test('should emit target-lost event', () => {
      const enemy = new Enemy(mockScene, 400, 300, mockPlayer, 200);
      mockPlayer.x = 450;
      mockPlayer.y = 300;
      enemy.update(0, 16);
      
      mockScene.events.emit.mockClear();
      mockPlayer.x = 700;
      enemy.update(0, 16);
      
      expect(mockScene.events.emit).toHaveBeenCalledWith('enemy-target-lost', enemy);
    });
  });

  describe('Attack System', () => {
    test('should respect attack cooldown', () => {
      const enemy = new Enemy(mockScene, 400, 300, mockPlayer, 200);
      mockScene.time.now = 1000;
      
      expect(enemy.canAttack()).toBe(true);
      
      enemy.attack();
      mockScene.time.now = 1500;
      
      expect(enemy.canAttack()).toBe(false);
    });

    test('should allow attack after cooldown expires', () => {
      const enemy = new Enemy(mockScene, 400, 300, mockPlayer, 200);
      mockScene.time.now = 1000;
      
      enemy.attack();
      mockScene.time.now = 1000 + ENEMY_CONFIG.ATTACK_COOLDOWN + 100;
      
      expect(enemy.canAttack()).toBe(true);
    });

    test('should emit attack event', () => {
      const enemy = new Enemy(mockScene, 400, 300, mockPlayer, 200);
      
      enemy.attack();
      
      expect(mockScene.events.emit).toHaveBeenCalledWith('enemy-attack', enemy);
    });

    test('should track last attack time', () => {
      const enemy = new Enemy(mockScene, 400, 300, mockPlayer, 200);
      mockScene.time.now = 5000;
      
      enemy.attack();
      
      expect(enemy.lastAttackTime).toBe(5000);
    });
  });

  describe('Movement Direction', () => {
    test('should calculate direction toward player', () => {
      const enemy = new Enemy(mockScene, 0, 0, mockPlayer, 200);
      mockPlayer.x = 3;
      mockPlayer.y = 4;
      
      const direction = enemy.getDirectionToPlayer();
      
      expect(direction.x).toBeCloseTo(0.6, 1);
      expect(direction.y).toBeCloseTo(0.8, 1);
    });

    test('should normalize direction vector', () => {
      const enemy = new Enemy(mockScene, 0, 0, mockPlayer, 200);
      mockPlayer.x = 100;
      mockPlayer.y = 0;
      
      const direction = enemy.getDirectionToPlayer();
      
      expect(Math.sqrt(direction.x ** 2 + direction.y ** 2)).toBeCloseTo(1.0, 2);
    });

    test('should handle same position', () => {
      const enemy = new Enemy(mockScene, 400, 300, mockPlayer, 200);
      mockPlayer.x = 400;
      mockPlayer.y = 300;
      
      const direction = enemy.getDirectionToPlayer();
      
      expect(direction.x).toBe(0);
      expect(direction.y).toBe(0);
    });
  });

  describe('State Management', () => {
    test('should be active by default', () => {
      const enemy = new Enemy(mockScene, 200, 300, mockPlayer);
      
      expect(enemy.isActive).toBe(true);
    });

    test('should allow deactivation', () => {
      const enemy = new Enemy(mockScene, 200, 300, mockPlayer);
      
      enemy.setActive(false);
      
      expect(enemy.isActive).toBe(false);
    });

    test('should not update when inactive', () => {
      const enemy = new Enemy(mockScene, 400, 300, mockPlayer, 200);
      mockPlayer.x = 450;
      mockPlayer.y = 300;
      enemy.setActive(false);
      
      enemy.update(0, 16);
      
      expect(enemy.hasTarget).toBe(false);
    });
  });

  describe('Cleanup', () => {
    test('should clean up graphics on destroy', () => {
      const enemy = new Enemy(mockScene, 200, 300, mockPlayer);
      const graphicsDestroySpy = jest.spyOn(enemy.graphics, 'destroy');
      
      enemy.destroy();
      
      expect(graphicsDestroySpy).toHaveBeenCalled();
    });
  });
});
