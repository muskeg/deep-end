/**
 * Unit Tests for Pearl Entity
 * TDD: Write tests first, then implement Pearl class
 */

import { PEARL_VALUE, COLORS } from '../../../src/utils/Constants.js';

describe('Pearl Entity', () => {
  let mockScene;
  let Pearl;

  beforeEach(async () => {
    const module = await import('../../../src/entities/Pearl.js');
    Pearl = module.default;

    mockScene = {
      add: {
        sprite: jest.fn(() => ({})),
        existing: jest.fn(),
        graphics: jest.fn(() => ({
          clear: jest.fn(),
          fillStyle: jest.fn(),
          fillCircle: jest.fn(),
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
      events: {
        emit: jest.fn()
      },
      tweens: {
        add: jest.fn((config) => {
          // Immediately trigger onComplete callback for testing
          if (config.onComplete) {
            setTimeout(() => config.onComplete(), 0);
          }
        })
      }
    };
  });

  describe('Initialization', () => {
    test('should create pearl at correct position', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      
      expect(pearl.x).toBe(150);
      expect(pearl.y).toBe(250);
    });

    test('should have default point value', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      
      expect(pearl.value).toBe(PEARL_VALUE);
    });

    test('should accept custom point value', () => {
      const pearl = new Pearl(mockScene, 150, 250, 25);
      
      expect(pearl.value).toBe(25);
    });

    test('should not be collected initially', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      
      expect(pearl.isCollected).toBe(false);
    });

    test('should have circular collision body', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      
      expect(pearl.body.setCircle).toHaveBeenCalled();
    });
  });

  describe('Collection', () => {
    test('should mark as collected when collect() is called', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      
      pearl.collect();
      
      expect(pearl.isCollected).toBe(true);
    });

    test('should emit pearl-collected event with value', () => {
      const pearl = new Pearl(mockScene, 150, 250, 15);
      
      pearl.collect();
      
      expect(mockScene.events.emit).toHaveBeenCalledWith('pearl-collected', 15);
    });

    test('should not be collectable twice', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      
      const result1 = pearl.collect();
      const result2 = pearl.collect();
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    test('should disable physics body after collection', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      
      pearl.collect();
      
      expect(pearl.body.enable).toBe(false);
    });

    test('should trigger collection animation', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      
      pearl.collect();
      
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    test('should destroy self after collection animation', (done) => {
      const pearl = new Pearl(mockScene, 150, 250);
      const destroySpy = jest.spyOn(pearl, 'destroy');
      
      pearl.collect();
      
      setTimeout(() => {
        expect(destroySpy).toHaveBeenCalled();
        done();
      }, 600); // Animation duration + buffer
    });
  });

  describe('Visual Effects', () => {
    test('should have floating animation', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      
      expect(mockScene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: pearl,
          yoyo: true,
          repeat: -1
        })
      );
    });

    test('should have shimmer effect', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      
      expect(mockScene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: expect.objectContaining({ alpha: expect.any(Number) })
        })
      );
    });

    test('should update visual state each frame', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      
      expect(() => pearl.update(16)).not.toThrow();
    });
  });

  describe('Physics Properties', () => {
    test('should not move from initial position without force', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      const initialX = pearl.x;
      const initialY = pearl.y;
      
      pearl.update(16);
      
      expect(pearl.x).toBe(initialX);
      expect(pearl.y).toBe(initialY);
    });

    test('should have correct collision radius', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      
      expect(pearl.body.setCircle).toHaveBeenCalledWith(expect.any(Number));
      const radius = pearl.body.setCircle.mock.calls[0][0];
      expect(radius).toBeLessThanOrEqual(16);
    });
  });

  describe('State Queries', () => {
    test('should report if already collected', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      
      expect(pearl.wasCollected()).toBe(false);
      
      pearl.collect();
      
      expect(pearl.wasCollected()).toBe(true);
    });

    test('should return point value', () => {
      const pearl = new Pearl(mockScene, 150, 250, 20);
      
      expect(pearl.getValue()).toBe(20);
    });
  });

  describe('Cleanup', () => {
    test('should stop animations when destroyed', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      pearl.floatTween = { stop: jest.fn() };
      pearl.shimmerTween = { stop: jest.fn() };
      
      pearl.destroy();
      
      expect(pearl.floatTween.stop).toHaveBeenCalled();
      expect(pearl.shimmerTween.stop).toHaveBeenCalled();
    });

    test('should clean up physics body', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      const destroySpy = jest.spyOn(pearl.body, 'destroy');
      
      pearl.destroy();
      
      expect(destroySpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero point value', () => {
      const pearl = new Pearl(mockScene, 150, 250, 0);
      
      expect(pearl.value).toBe(0);
      pearl.collect();
      expect(mockScene.events.emit).toHaveBeenCalledWith('pearl-collected', 0);
    });

    test('should handle negative point value gracefully', () => {
      const pearl = new Pearl(mockScene, 150, 250, -10);
      
      expect(pearl.value).toBe(-10);
    });

    test('should handle destruction before collection', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      
      expect(() => pearl.destroy()).not.toThrow();
      expect(pearl.isCollected).toBe(false);
    });

    test('should handle collection after scene destroyed', () => {
      const pearl = new Pearl(mockScene, 150, 250);
      mockScene.events.emit = jest.fn(() => { throw new Error('Scene destroyed'); });
      
      expect(() => pearl.collect()).not.toThrow();
    });
  });
});
