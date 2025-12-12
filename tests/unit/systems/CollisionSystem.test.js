/**
 * Unit Tests for CollisionSystem
 * TDD: Write tests first, then implement CollisionSystem
 */

describe('CollisionSystem', () => {
  let mockScene;
  let mockPlayer;
  let CollisionSystem;

  beforeEach(async () => {
    const module = await import('../../../src/systems/CollisionSystem.js');
    CollisionSystem = module.default;

    mockPlayer = {
      x: 400,
      y: 300,
      body: {
        velocity: { x: 0, y: 0 },
        width: 32,
        height: 32
      }
    };

    mockScene = {
      physics: {
        add: {
          collider: jest.fn()
        }
      },
      events: {
        emit: jest.fn()
      },
      time: {
        now: 1000
      }
    };
  });

  describe('Initialization', () => {
    test('should create system with scene and player', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      
      expect(system.scene).toBe(mockScene);
      expect(system.player).toBe(mockPlayer);
    });

    test('should initialize with empty walls array', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      
      expect(system.walls).toEqual([]);
    });

    test('should be active by default', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      
      expect(system.isActive).toBe(true);
    });
  });

  describe('Wall Management', () => {
    test('should add wall to system', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      const mockWall = { x: 100, y: 100, width: 50, height: 50 };
      
      system.addWall(mockWall);
      
      expect(system.walls).toContain(mockWall);
    });

    test('should add multiple walls', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      const wall1 = { x: 100, y: 100, width: 50, height: 50 };
      const wall2 = { x: 200, y: 200, width: 50, height: 50 };
      
      system.addWall(wall1);
      system.addWall(wall2);
      
      expect(system.walls.length).toBe(2);
    });

    test('should remove wall from system', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      const mockWall = { x: 100, y: 100, width: 50, height: 50 };
      system.addWall(mockWall);
      
      system.removeWall(mockWall);
      
      expect(system.walls).not.toContain(mockWall);
    });

    test('should clear all walls', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      system.addWall({ x: 100, y: 100, width: 50, height: 50 });
      system.addWall({ x: 200, y: 200, width: 50, height: 50 });
      
      system.clearWalls();
      
      expect(system.walls.length).toBe(0);
    });
  });

  describe('Collision Detection', () => {
    test('should detect collision with wall', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      const wall = { x: 400, y: 300, width: 50, height: 50 };
      system.addWall(wall);
      
      const collision = system.checkCollision(mockPlayer, wall);
      
      expect(collision).toBe(true);
    });

    test('should not detect collision when separated', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      const wall = { x: 600, y: 500, width: 50, height: 50 };
      system.addWall(wall);
      
      const collision = system.checkCollision(mockPlayer, wall);
      
      expect(collision).toBe(false);
    });

    test('should detect collision at edge', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      mockPlayer.x = 100;
      mockPlayer.y = 100;
      const wall = { x: 116, y: 100, width: 32, height: 32 }; // Just touching
      system.addWall(wall);
      
      const collision = system.checkCollision(mockPlayer, wall);
      
      expect(collision).toBe(true);
    });
  });

  describe('Sliding Collision Response', () => {
    test('should slide along horizontal wall when moving down', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      mockPlayer.x = 400;
      mockPlayer.y = 280;
      mockPlayer.body.velocity = { x: 50, y: 100 };
      const wall = { x: 400, y: 300, width: 100, height: 20 };
      system.addWall(wall);
      
      system.resolveCollision(mockPlayer, wall);
      
      expect(mockPlayer.body.velocity.y).toBe(0); // Vertical stopped
      expect(mockPlayer.body.velocity.x).toBe(50); // Horizontal preserved
    });

    test('should slide along vertical wall when moving right', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      mockPlayer.x = 380;
      mockPlayer.y = 300;
      mockPlayer.body.velocity = { x: 100, y: 50 };
      const wall = { x: 400, y: 300, width: 20, height: 100 };
      system.addWall(wall);
      
      system.resolveCollision(mockPlayer, wall);
      
      expect(mockPlayer.body.velocity.x).toBe(0); // Horizontal stopped
      expect(mockPlayer.body.velocity.y).toBe(50); // Vertical preserved
    });

    test('should stop movement into corner', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      mockPlayer.x = 380;
      mockPlayer.y = 280;
      mockPlayer.body.velocity = { x: 100, y: 100 };
      const wall = { x: 400, y: 300, width: 50, height: 50 };
      system.addWall(wall);
      
      system.resolveCollision(mockPlayer, wall);
      
      // Both directions should be stopped for corner collision
      expect(mockPlayer.body.velocity.x).toBe(0);
      expect(mockPlayer.body.velocity.y).toBe(0);
    });

    test('should push player out of wall overlap', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      mockPlayer.x = 405;
      mockPlayer.y = 300;
      mockPlayer.body.velocity = { x: 50, y: 0 };
      const wall = { x: 400, y: 300, width: 50, height: 50 };
      system.addWall(wall);
      
      const originalX = mockPlayer.x;
      system.resolveCollision(mockPlayer, wall);
      
      expect(mockPlayer.x).not.toBe(originalX); // Player pushed
    });
  });

  describe('Update Loop', () => {
    test('should check all walls each update', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      const wall1 = { x: 400, y: 300, width: 50, height: 50 };
      const wall2 = { x: 450, y: 300, width: 50, height: 50 };
      system.addWall(wall1);
      system.addWall(wall2);
      const checkSpy = jest.spyOn(system, 'checkCollision');
      
      system.update(0.016);
      
      expect(checkSpy).toHaveBeenCalledWith(mockPlayer, wall1);
      expect(checkSpy).toHaveBeenCalledWith(mockPlayer, wall2);
    });

    test('should resolve collisions when detected', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      mockPlayer.body.velocity = { x: 100, y: 0 };
      const wall = { x: 420, y: 300, width: 50, height: 50 };
      system.addWall(wall);
      const resolveSpy = jest.spyOn(system, 'resolveCollision');
      
      system.update(0.016);
      
      expect(resolveSpy).toHaveBeenCalledWith(mockPlayer, wall);
    });

    test('should not check collisions when inactive', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      const wall = { x: 400, y: 300, width: 50, height: 50 };
      system.addWall(wall);
      const checkSpy = jest.spyOn(system, 'checkCollision');
      system.pause();
      
      system.update(0.016);
      
      expect(checkSpy).not.toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    test('should pause system', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      
      system.pause();
      
      expect(system.isActive).toBe(false);
    });

    test('should resume system', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      system.pause();
      
      system.resume();
      
      expect(system.isActive).toBe(true);
    });
  });

  describe('Statistics', () => {
    test('should track collision count', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      const wall = { x: 400, y: 300, width: 50, height: 50 };
      system.addWall(wall);
      
      system.update(0.016);
      system.update(0.016);
      
      expect(system.getTotalCollisions()).toBeGreaterThan(0);
    });

    test('should reset statistics', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      const wall = { x: 400, y: 300, width: 50, height: 50 };
      system.addWall(wall);
      system.update(0.016);
      
      system.reset();
      
      expect(system.getTotalCollisions()).toBe(0);
    });
  });

  describe('Events', () => {
    test('should emit collision event', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      const wall = { x: 400, y: 300, width: 50, height: 50 };
      system.addWall(wall);
      
      system.update(0.016);
      
      expect(mockScene.events.emit).toHaveBeenCalledWith('wall-collision', expect.objectContaining({
        player: mockPlayer,
        wall: wall
      }));
    });

    test('should not emit events when inactive', () => {
      const system = new CollisionSystem(mockScene, mockPlayer);
      const wall = { x: 400, y: 300, width: 50, height: 50 };
      system.addWall(wall);
      system.pause();
      
      system.update(0.016);
      
      expect(mockScene.events.emit).not.toHaveBeenCalled();
    });
  });
});
