/**
 * Unit Tests for CurrentSystem
 * TDD: Write tests first, then implement CurrentSystem
 */

describe('CurrentSystem', () => {
  let mockScene;
  let mockPlayer;
  let CurrentSystem;

  beforeEach(async () => {
    const module = await import('../../../src/systems/CurrentSystem.js');
    CurrentSystem = module.default;

    mockPlayer = {
      x: 400,
      y: 300,
      body: {
        velocity: { x: 0, y: 0 }
      }
    };

    mockScene = {
      events: {
        emit: jest.fn()
      }
    };
  });

  describe('Initialization', () => {
    test('should create system with scene and player', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      
      expect(system.scene).toBe(mockScene);
      expect(system.player).toBe(mockPlayer);
    });

    test('should initialize with empty currents array', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      
      expect(system.currents).toEqual([]);
    });

    test('should be active by default', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      
      expect(system.isActive).toBe(true);
    });
  });

  describe('Current Management', () => {
    test('should add current to system', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      const mockCurrent = {
        x: 200,
        y: 300,
        width: 100,
        height: 100,
        isEntityInRange: jest.fn(() => false),
        getForce: jest.fn(() => ({ x: 50, y: 0 }))
      };
      
      system.addCurrent(mockCurrent);
      
      expect(system.currents).toContain(mockCurrent);
    });

    test('should add multiple currents', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      const current1 = { isEntityInRange: jest.fn(() => false), getForce: jest.fn() };
      const current2 = { isEntityInRange: jest.fn(() => false), getForce: jest.fn() };
      
      system.addCurrent(current1);
      system.addCurrent(current2);
      
      expect(system.currents.length).toBe(2);
    });

    test('should remove current from system', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      const mockCurrent = { isEntityInRange: jest.fn(() => false), getForce: jest.fn() };
      system.addCurrent(mockCurrent);
      
      system.removeCurrent(mockCurrent);
      
      expect(system.currents).not.toContain(mockCurrent);
    });

    test('should clear all currents', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      system.addCurrent({ isEntityInRange: jest.fn(() => false), getForce: jest.fn() });
      system.addCurrent({ isEntityInRange: jest.fn(() => false), getForce: jest.fn() });
      
      system.clearCurrents();
      
      expect(system.currents.length).toBe(0);
    });
  });

  describe('Force Application', () => {
    test('should apply force when player in current range', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      const mockCurrent = {
        isEntityInRange: jest.fn(() => true),
        getForce: jest.fn(() => ({ x: 50, y: 0 }))
      };
      system.addCurrent(mockCurrent);
      
      system.update(0.016); // ~60fps
      
      expect(mockPlayer.body.velocity.x).toBe(50);
      expect(mockCurrent.isEntityInRange).toHaveBeenCalledWith(mockPlayer);
      expect(mockCurrent.getForce).toHaveBeenCalled();
    });

    test('should not apply force when player outside range', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      const mockCurrent = {
        isEntityInRange: jest.fn(() => false),
        getForce: jest.fn(() => ({ x: 50, y: 0 }))
      };
      system.addCurrent(mockCurrent);
      
      system.update(0.016);
      
      expect(mockPlayer.body.velocity.x).toBe(0);
      expect(mockCurrent.getForce).not.toHaveBeenCalled();
    });

    test('should combine forces from multiple currents', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      const current1 = {
        isEntityInRange: jest.fn(() => true),
        getForce: jest.fn(() => ({ x: 30, y: 0 }))
      };
      const current2 = {
        isEntityInRange: jest.fn(() => true),
        getForce: jest.fn(() => ({ x: 20, y: 0 }))
      };
      system.addCurrent(current1);
      system.addCurrent(current2);
      
      system.update(0.016);
      
      expect(mockPlayer.body.velocity.x).toBe(50);
    });

    test('should handle diagonal forces correctly', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      const mockCurrent = {
        isEntityInRange: jest.fn(() => true),
        getForce: jest.fn(() => ({ x: 30, y: 40 }))
      };
      system.addCurrent(mockCurrent);
      
      system.update(0.016);
      
      expect(mockPlayer.body.velocity.x).toBe(30);
      expect(mockPlayer.body.velocity.y).toBe(40);
    });

    test('should scale force by delta time', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      const mockCurrent = {
        isEntityInRange: jest.fn(() => true),
        getForce: jest.fn(() => ({ x: 100, y: 0 }))
      };
      system.addCurrent(mockCurrent);
      
      system.update(0.032); // Double time
      
      // Force should be scaled by delta but velocity set directly, not accumulated
      expect(mockPlayer.body.velocity.x).toBe(100);
    });
  });

  describe('State Management', () => {
    test('should pause system', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      const mockCurrent = {
        isEntityInRange: jest.fn(() => true),
        getForce: jest.fn(() => ({ x: 50, y: 0 }))
      };
      system.addCurrent(mockCurrent);
      
      system.pause();
      system.update(0.016);
      
      expect(system.isActive).toBe(false);
      expect(mockPlayer.body.velocity.x).toBe(0);
    });

    test('should resume system', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      const mockCurrent = {
        isEntityInRange: jest.fn(() => true),
        getForce: jest.fn(() => ({ x: 50, y: 0 }))
      };
      system.addCurrent(mockCurrent);
      system.pause();
      
      system.resume();
      system.update(0.016);
      
      expect(system.isActive).toBe(true);
      expect(mockPlayer.body.velocity.x).toBe(50);
    });
  });

  describe('Statistics', () => {
    test('should track time in currents', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      const mockCurrent = {
        isEntityInRange: jest.fn(() => true),
        getForce: jest.fn(() => ({ x: 50, y: 0 }))
      };
      system.addCurrent(mockCurrent);
      
      system.update(1.0); // 1 second
      system.update(0.5); // 0.5 seconds
      
      expect(system.getTotalTimeInCurrents()).toBeCloseTo(1.5, 1);
    });

    test('should not track time when outside currents', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      const mockCurrent = {
        isEntityInRange: jest.fn(() => false),
        getForce: jest.fn(() => ({ x: 50, y: 0 }))
      };
      system.addCurrent(mockCurrent);
      
      system.update(1.0);
      
      expect(system.getTotalTimeInCurrents()).toBe(0);
    });

    test('should detect when player enters current', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      const mockCurrent = {
        isEntityInRange: jest.fn(() => true),
        getForce: jest.fn(() => ({ x: 50, y: 0 }))
      };
      system.addCurrent(mockCurrent);
      
      system.update(0.016);
      
      expect(mockScene.events.emit).toHaveBeenCalledWith('player-entered-current', mockCurrent);
    });

    test('should detect when player exits current', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      const mockCurrent = {
        isEntityInRange: jest.fn()
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(false),
        getForce: jest.fn(() => ({ x: 50, y: 0 }))
      };
      system.addCurrent(mockCurrent);
      
      system.update(0.016); // Enter
      mockScene.events.emit.mockClear();
      system.update(0.016); // Exit
      
      expect(mockScene.events.emit).toHaveBeenCalledWith('player-exited-current', mockCurrent);
    });

    test('should not emit duplicate enter events', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      const mockCurrent = {
        isEntityInRange: jest.fn(() => true),
        getForce: jest.fn(() => ({ x: 50, y: 0 }))
      };
      system.addCurrent(mockCurrent);
      
      system.update(0.016);
      mockScene.events.emit.mockClear();
      system.update(0.016);
      
      expect(mockScene.events.emit).not.toHaveBeenCalledWith('player-entered-current', expect.anything());
    });
  });

  describe('Reset', () => {
    test('should reset statistics', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      const mockCurrent = {
        isEntityInRange: jest.fn(() => true),
        getForce: jest.fn(() => ({ x: 50, y: 0 }))
      };
      system.addCurrent(mockCurrent);
      system.update(1.0);
      
      system.reset();
      
      expect(system.getTotalTimeInCurrents()).toBe(0);
    });

    test('should clear active currents state', () => {
      const system = new CurrentSystem(mockScene, mockPlayer);
      const mockCurrent = {
        isEntityInRange: jest.fn(() => true),
        getForce: jest.fn(() => ({ x: 50, y: 0 }))
      };
      system.addCurrent(mockCurrent);
      system.update(0.016);
      
      system.reset();
      mockScene.events.emit.mockClear();
      system.update(0.016);
      
      expect(mockScene.events.emit).toHaveBeenCalledWith('player-entered-current', mockCurrent);
    });
  });
});
