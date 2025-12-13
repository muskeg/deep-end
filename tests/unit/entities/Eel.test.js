/**
 * Unit Tests for Eel Enemy
 * TDD: Write tests first, then implement Eel class
 */

import { ENEMY_CONFIG } from '../../../src/utils/Constants.js';

describe('Eel Entity', () => {
  let mockScene;
  let mockPlayer;
  let Eel;

  beforeEach(async () => {
    const module = await import('../../../src/entities/Eel.js');
    Eel = module.default;

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
          fillRect: jest.fn(),
          lineStyle: jest.fn(),
          strokeCircle: jest.fn(),
          destroy: jest.fn()
        }))
      },
      physics: {
        add: {
          sprite: jest.fn(() => ({
            body: {
              setCircle: jest.fn(),
              velocity: { x: 0, y: 0 }
            }
          })),
          existing: jest.fn()
        }
      },
      time: {
        now: 1000,
        delayedCall: jest.fn()
      },
      events: {
        emit: jest.fn()
      }
    };
  });

  describe('Initialization', () => {
    test('should create eel at correct position', () => {
      const eel = new Eel(mockScene, 200, 300, mockPlayer);
      
      expect(eel.x).toBe(200);
      expect(eel.y).toBe(300);
    });

    test('should have hiding position', () => {
      const hidingPos = { x: 200, y: 300 };
      const eel = new Eel(mockScene, 200, 300, mockPlayer, hidingPos);
      
      expect(eel.hidingPosition).toEqual(hidingPos);
    });

    test('should default to start position as hiding position', () => {
      const eel = new Eel(mockScene, 200, 300, mockPlayer);
      
      expect(eel.hidingPosition.x).toBe(200);
      expect(eel.hidingPosition.y).toBe(300);
    });

    test('should start in idle state', () => {
      const eel = new Eel(mockScene, 200, 300, mockPlayer);
      
      expect(eel.state).toBe('idle');
    });

    test('should have chase speed', () => {
      const eel = new Eel(mockScene, 200, 300, mockPlayer);
      
      expect(eel.chaseSpeed).toBe(ENEMY_CONFIG.EEL.CHASE_SPEED);
    });

    test('should have lunge speed', () => {
      const eel = new Eel(mockScene, 200, 300, mockPlayer);
      
      expect(eel.lungeSpeed).toBe(ENEMY_CONFIG.EEL.LUNGE_SPEED);
    });
  });

  describe('Detection & Chase', () => {
    test('should detect player within range', () => {
      const eel = new Eel(mockScene, 400, 300, mockPlayer);
      mockPlayer.x = 450;
      mockPlayer.y = 300;
      
      eel.update(0, 16);
      
      expect(eel.state).toBe('chasing');
    });

    test('should chase player when detected', () => {
      const eel = new Eel(mockScene, 400, 300, mockPlayer);
      mockPlayer.x = 500;
      mockPlayer.y = 300;
      eel.state = 'chasing';
      
      eel.chase(16);
      
      expect(eel.body.velocity.x).toBeGreaterThan(0);
    });

    test('should use chase speed when pursuing', () => {
      const eel = new Eel(mockScene, 400, 300, mockPlayer);
      mockPlayer.x = 500;
      mockPlayer.y = 300;
      eel.state = 'chasing';
      
      eel.chase(16);
      
      const speed = Math.sqrt(
        eel.body.velocity.x ** 2 + 
        eel.body.velocity.y ** 2
      );
      expect(speed).toBeCloseTo(ENEMY_CONFIG.EEL.CHASE_SPEED, 0);
    });

    test('should stay in idle when player out of range', () => {
      const eel = new Eel(mockScene, 400, 300, mockPlayer);
      mockPlayer.x = 800;
      mockPlayer.y = 300;
      
      eel.update(0, 16);
      
      expect(eel.state).toBe('idle');
    });
  });

  describe('Lunge Attack', () => {
    test('should initiate lunge when close to player', () => {
      const eel = new Eel(mockScene, 400, 300, mockPlayer);
      mockPlayer.x = 420;
      mockPlayer.y = 300;
      eel.state = 'chasing';
      eel.hasTarget = true; // Ensure target is acquired
      
      eel.update(0, 16);
      
      expect(eel.state).toBe('lunging');
    });

    test('should use lunge speed during attack', () => {
      const eel = new Eel(mockScene, 400, 300, mockPlayer);
      mockPlayer.x = 420;
      mockPlayer.y = 300;
      eel.state = 'lunging';
      eel.lungeDirection = { x: 1, y: 0 };
      
      eel.lunge(16);
      
      const speed = Math.sqrt(
        eel.body.velocity.x ** 2 + 
        eel.body.velocity.y ** 2
      );
      expect(speed).toBeCloseTo(ENEMY_CONFIG.EEL.LUNGE_SPEED, 0);
    });

    test('should maintain lunge direction', () => {
      const eel = new Eel(mockScene, 400, 300, mockPlayer);
      eel.state = 'lunging';
      eel.lungeDirection = { x: 0.707, y: 0.707 };
      mockPlayer.x = 500;
      mockPlayer.y = 400;
      
      eel.lunge(16);
      
      expect(eel.body.velocity.x).toBeCloseTo(0.707 * ENEMY_CONFIG.EEL.LUNGE_SPEED, 0);
      expect(eel.body.velocity.y).toBeCloseTo(0.707 * ENEMY_CONFIG.EEL.LUNGE_SPEED, 0);
    });

    test('should respect lunge cooldown', () => {
      const eel = new Eel(mockScene, 400, 300, mockPlayer);
      mockPlayer.x = 420;
      mockPlayer.y = 300;
      eel.state = 'chasing';
      eel.lastLungeTime = -1500; // Set so cooldown has expired
      mockScene.time.now = 1000;
      
      eel.update(0, 16);
      
      expect(eel.state).toBe('lunging');
    });

    test('should not lunge during cooldown', () => {
      const eel = new Eel(mockScene, 400, 300, mockPlayer);
      mockPlayer.x = 420;
      mockPlayer.y = 300;
      eel.state = 'chasing';
      eel.lastLungeTime = 999;
      mockScene.time.now = 1000;
      
      eel.update(0, 16);
      
      expect(eel.state).toBe('chasing');
    });
  });

  describe('Return to Hiding', () => {
    test('should return to hiding after losing target', () => {
      const eel = new Eel(mockScene, 500, 300, mockPlayer);
      eel.hidingPosition = { x: 200, y: 300 };
      eel.state = 'chasing';
      mockPlayer.x = 900;
      mockPlayer.y = 300;
      
      eel.update(0, 16);
      
      expect(eel.state).toBe('returning');
    });

    test('should move toward hiding position', () => {
      const eel = new Eel(mockScene, 500, 300, mockPlayer);
      eel.hidingPosition = { x: 200, y: 300 };
      eel.state = 'returning';
      
      eel.returnToHiding(16);
      
      expect(eel.body.velocity.x).toBeLessThan(0);
    });

    test('should use chase speed when returning', () => {
      const eel = new Eel(mockScene, 500, 300, mockPlayer);
      eel.hidingPosition = { x: 200, y: 300 };
      eel.state = 'returning';
      
      eel.returnToHiding(16);
      
      const speed = Math.sqrt(
        eel.body.velocity.x ** 2 + 
        eel.body.velocity.y ** 2
      );
      expect(speed).toBeCloseTo(ENEMY_CONFIG.EEL.CHASE_SPEED, 0);
    });

    test('should return to idle when reaching hiding position', () => {
      const eel = new Eel(mockScene, 205, 300, mockPlayer);
      eel.hidingPosition = { x: 200, y: 300 };
      eel.state = 'returning';
      
      eel.returnToHiding(16);
      
      expect(eel.state).toBe('idle');
    });
  });

  describe('State Machine', () => {
    test('should transition from idle to chasing', () => {
      const eel = new Eel(mockScene, 400, 300, mockPlayer);
      mockPlayer.x = 450;
      mockPlayer.y = 300;
      
      eel.update(0, 16);
      
      expect(eel.state).toBe('chasing');
    });

    test('should transition from chasing to lunging', () => {
      const eel = new Eel(mockScene, 400, 300, mockPlayer);
      mockPlayer.x = 420;
      mockPlayer.y = 300;
      eel.state = 'chasing';
      
      eel.update(0, 16);
      
      expect(eel.state).toBe('lunging');
    });

    test('should transition from lunging to chasing', () => {
      const eel = new Eel(mockScene, 400, 300, mockPlayer);
      mockPlayer.x = 450;
      mockPlayer.y = 300;
      eel.state = 'lunging';
      eel.lungeStartTime = 0;
      mockScene.time.now = ENEMY_CONFIG.EEL.LUNGE_DURATION + 100;
      
      eel.update(0, 16);
      
      expect(eel.state).toBe('chasing');
    });

    test('should transition from chasing to returning', () => {
      const eel = new Eel(mockScene, 400, 300, mockPlayer);
      eel.state = 'chasing';
      mockPlayer.x = 800;
      mockPlayer.y = 300;
      
      eel.update(0, 16);
      
      expect(eel.state).toBe('returning');
    });

    test('should transition from returning to idle', () => {
      const eel = new Eel(mockScene, 205, 300, mockPlayer);
      eel.hidingPosition = { x: 200, y: 300 };
      eel.state = 'returning';
      
      eel.update(0, 16);
      
      expect(eel.state).toBe('idle');
    });
  });

  describe('Visual Updates', () => {
    test('should update visuals each frame', () => {
      const eel = new Eel(mockScene, 200, 300, mockPlayer);
      const updateVisualsSpy = jest.spyOn(eel, 'updateVisuals');
      
      eel.update(0, 16);
      
      expect(updateVisualsSpy).toHaveBeenCalled();
    });

    test('should change color when chasing', () => {
      const eel = new Eel(mockScene, 400, 300, mockPlayer);
      mockPlayer.x = 450;
      mockPlayer.y = 300;
      
      eel.update(0, 16);
      
      expect(eel.graphics.fillStyle).toHaveBeenCalled();
    });

    test('should change color when lunging', () => {
      const eel = new Eel(mockScene, 400, 300, mockPlayer);
      eel.state = 'lunging';
      
      eel.updateVisuals();
      
      expect(eel.graphics.fillStyle).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    test('should destroy graphics on cleanup', () => {
      const eel = new Eel(mockScene, 200, 300, mockPlayer);
      
      eel.destroy();
      
      expect(eel.graphics.destroy).toHaveBeenCalled();
    });
  });
});
