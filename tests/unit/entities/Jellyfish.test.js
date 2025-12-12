/**
 * Unit Tests for Jellyfish Enemy
 * TDD: Write tests first, then implement Jellyfish class
 */

import { ENEMY_CONFIG } from '../../../src/utils/Constants.js';

describe('Jellyfish Entity', () => {
  let mockScene;
  let mockPlayer;
  let Jellyfish;

  beforeEach(async () => {
    const module = await import('../../../src/entities/Jellyfish.js');
    Jellyfish = module.default;

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
          beginPath: jest.fn(),
          moveTo: jest.fn(),
          lineTo: jest.fn(),
          strokePath: jest.fn(),
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
        now: 1000
      },
      events: {
        emit: jest.fn()
      }
    };
  });

  describe('Initialization', () => {
    test('should create jellyfish at correct position', () => {
      const jellyfish = new Jellyfish(mockScene, 200, 300, mockPlayer);
      
      expect(jellyfish.x).toBe(200);
      expect(jellyfish.y).toBe(300);
    });

    test('should have patrol waypoints', () => {
      const waypoints = [
        { x: 100, y: 100 },
        { x: 200, y: 100 },
        { x: 200, y: 200 }
      ];
      const jellyfish = new Jellyfish(mockScene, 100, 100, mockPlayer, waypoints);
      
      expect(jellyfish.waypoints).toEqual(waypoints);
    });

    test('should start at first waypoint', () => {
      const waypoints = [
        { x: 100, y: 100 },
        { x: 200, y: 100 }
      ];
      const jellyfish = new Jellyfish(mockScene, 100, 100, mockPlayer, waypoints);
      
      expect(jellyfish.currentWaypointIndex).toBe(0);
    });

    test('should have patrol speed', () => {
      const jellyfish = new Jellyfish(mockScene, 200, 300, mockPlayer);
      
      expect(jellyfish.patrolSpeed).toBe(ENEMY_CONFIG.JELLYFISH.PATROL_SPEED);
    });
  });

  describe('Patrol Behavior', () => {
    test('should move toward current waypoint', () => {
      const waypoints = [
        { x: 100, y: 100 },
        { x: 200, y: 100 }
      ];
      const jellyfish = new Jellyfish(mockScene, 100, 100, mockPlayer, waypoints);
      
      jellyfish.patrol(16);
      
      expect(jellyfish.body.velocity.x).toBeGreaterThan(0);
    });

    test('should reach waypoint and move to next', () => {
      const waypoints = [
        { x: 100, y: 100 },
        { x: 200, y: 100 },
        { x: 200, y: 200 }
      ];
      const jellyfish = new Jellyfish(mockScene, 100, 100, mockPlayer, waypoints);
      jellyfish.x = 195;
      jellyfish.y = 100;
      jellyfish.currentWaypointIndex = 1; // Currently moving toward waypoint[1]
      
      jellyfish.patrol(16);
      
      expect(jellyfish.currentWaypointIndex).toBe(2);
    });

    test('should loop back to first waypoint', () => {
      const waypoints = [
        { x: 100, y: 100 },
        { x: 200, y: 100 }
      ];
      const jellyfish = new Jellyfish(mockScene, 195, 100, mockPlayer, waypoints);
      jellyfish.currentWaypointIndex = 1;
      
      jellyfish.patrol(16);
      
      expect(jellyfish.currentWaypointIndex).toBe(0);
    });

    test('should use patrol speed when patrolling', () => {
      const waypoints = [
        { x: 100, y: 100 },
        { x: 200, y: 100 }
      ];
      const jellyfish = new Jellyfish(mockScene, 100, 100, mockPlayer, waypoints);
      
      jellyfish.patrol(16);
      
      const speed = Math.sqrt(
        jellyfish.body.velocity.x ** 2 + 
        jellyfish.body.velocity.y ** 2
      );
      expect(speed).toBeCloseTo(ENEMY_CONFIG.JELLYFISH.PATROL_SPEED, 0);
    });
  });

  describe('Chase Behavior', () => {
    test('should chase player when detected', () => {
      const jellyfish = new Jellyfish(mockScene, 400, 300, mockPlayer);
      mockPlayer.x = 450;
      mockPlayer.y = 300;
      
      jellyfish.update(0, 16);
      
      expect(jellyfish.hasTarget).toBe(true);
    });

    test('should use chase speed when pursuing', () => {
      const jellyfish = new Jellyfish(mockScene, 400, 300, mockPlayer);
      mockPlayer.x = 500;
      mockPlayer.y = 300;
      jellyfish.hasTarget = true;
      
      jellyfish.chase(16);
      
      const speed = Math.sqrt(
        jellyfish.body.velocity.x ** 2 + 
        jellyfish.body.velocity.y ** 2
      );
      expect(speed).toBeCloseTo(ENEMY_CONFIG.JELLYFISH.CHASE_SPEED, 0);
    });

    test('should move toward player when chasing', () => {
      const jellyfish = new Jellyfish(mockScene, 400, 300, mockPlayer);
      mockPlayer.x = 500;
      mockPlayer.y = 300;
      jellyfish.hasTarget = true;
      
      jellyfish.chase(16);
      
      expect(jellyfish.body.velocity.x).toBeGreaterThan(0);
    });

    test('should return to patrol after losing target', () => {
      const waypoints = [
        { x: 100, y: 100 },
        { x: 200, y: 100 }
      ];
      const jellyfish = new Jellyfish(mockScene, 400, 300, mockPlayer, waypoints);
      mockPlayer.x = 450;
      mockPlayer.y = 300;
      jellyfish.update(0, 16);
      
      mockPlayer.x = 800;
      jellyfish.update(0, 16);
      
      expect(jellyfish.hasTarget).toBe(false);
    });
  });

  describe('Update Logic', () => {
    test('should patrol when no target', () => {
      const waypoints = [
        { x: 100, y: 100 },
        { x: 200, y: 100 }
      ];
      const jellyfish = new Jellyfish(mockScene, 100, 100, mockPlayer, waypoints);
      const patrolSpy = jest.spyOn(jellyfish, 'patrol');
      
      jellyfish.update(0, 16);
      
      expect(patrolSpy).toHaveBeenCalled();
    });

    test('should chase when target acquired', () => {
      const jellyfish = new Jellyfish(mockScene, 400, 300, mockPlayer);
      mockPlayer.x = 450;
      mockPlayer.y = 300;
      const chaseSpy = jest.spyOn(jellyfish, 'chase');
      
      jellyfish.update(0, 16);
      jellyfish.update(0, 16);
      
      expect(chaseSpy).toHaveBeenCalled();
    });
  });

  describe('Visual Updates', () => {
    test('should update visuals each frame', () => {
      const jellyfish = new Jellyfish(mockScene, 200, 300, mockPlayer);
      const updateVisualsSpy = jest.spyOn(jellyfish, 'updateVisuals');
      
      jellyfish.update(0, 16);
      
      expect(updateVisualsSpy).toHaveBeenCalled();
    });

    test('should change color when chasing', () => {
      const jellyfish = new Jellyfish(mockScene, 400, 300, mockPlayer);
      mockPlayer.x = 450;
      mockPlayer.y = 300;
      
      jellyfish.update(0, 16);
      
      expect(jellyfish.graphics.fillStyle).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty waypoint list', () => {
      const jellyfish = new Jellyfish(mockScene, 200, 300, mockPlayer, []);
      
      expect(() => jellyfish.update(0, 16)).not.toThrow();
    });

    test('should handle single waypoint', () => {
      const waypoints = [{ x: 200, y: 300 }];
      const jellyfish = new Jellyfish(mockScene, 200, 300, mockPlayer, waypoints);
      
      jellyfish.patrol(16);
      
      expect(jellyfish.currentWaypointIndex).toBe(0);
    });
  });
});
