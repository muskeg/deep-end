/**
 * Unit Tests for InputHandler Utility
 * TDD: Write tests first, then implement InputHandler class
 */

import { INPUTS } from '../../../src/utils/Constants.js';

describe('InputHandler', () => {
  let mockScene;
  let InputHandler;

  beforeEach(async () => {
    const module = await import('../../../src/utils/InputHandler.js');
    InputHandler = module.default;

    mockScene = {
      input: {
        keyboard: {
          addKeys: jest.fn(() => ({
            W: { isDown: false },
            A: { isDown: false },
            S: { isDown: false },
            D: { isDown: false },
            SPACE: { isDown: false },
            ESC: { isDown: false }
          })),
          createCursorKeys: jest.fn(() => ({
            up: { isDown: false },
            down: { isDown: false },
            left: { isDown: false },
            right: { isDown: false }
          })),
          on: jest.fn(),
          once: jest.fn()
        }
      }
    };
  });

  describe('Initialization', () => {
    test('should create input handler with scene', () => {
      const handler = new InputHandler(mockScene);
      
      expect(handler.scene).toBe(mockScene);
    });

    test('should register cursor keys', () => {
      new InputHandler(mockScene);
      
      expect(mockScene.input.keyboard.createCursorKeys).toHaveBeenCalled();
    });

    test('should register WASD keys', () => {
      new InputHandler(mockScene);
      
      expect(mockScene.input.keyboard.addKeys).toHaveBeenCalledWith(
        expect.objectContaining({ W: 'W', A: 'A', S: 'S', D: 'D' })
      );
    });

    test('should register spacebar key', () => {
      new InputHandler(mockScene);
      
      expect(mockScene.input.keyboard.addKeys).toHaveBeenCalledWith(
        expect.objectContaining({ SPACE: 'SPACE' })
      );
    });
  });

  describe('Movement Input', () => {
    test('should detect up movement from arrow key', () => {
      const handler = new InputHandler(mockScene);
      handler.cursors.up.isDown = true;
      
      const input = handler.getMovementInput();
      
      expect(input.up).toBe(true);
    });

    test('should detect up movement from W key', () => {
      const handler = new InputHandler(mockScene);
      handler.keys.W.isDown = true;
      
      const input = handler.getMovementInput();
      
      expect(input.up).toBe(true);
    });

    test('should detect down movement from arrow key', () => {
      const handler = new InputHandler(mockScene);
      handler.cursors.down.isDown = true;
      
      const input = handler.getMovementInput();
      
      expect(input.down).toBe(true);
    });

    test('should detect down movement from S key', () => {
      const handler = new InputHandler(mockScene);
      handler.keys.S.isDown = true;
      
      const input = handler.getMovementInput();
      
      expect(input.down).toBe(true);
    });

    test('should detect left movement from arrow key', () => {
      const handler = new InputHandler(mockScene);
      handler.cursors.left.isDown = true;
      
      const input = handler.getMovementInput();
      
      expect(input.left).toBe(true);
    });

    test('should detect left movement from A key', () => {
      const handler = new InputHandler(mockScene);
      handler.keys.A.isDown = true;
      
      const input = handler.getMovementInput();
      
      expect(input.left).toBe(true);
    });

    test('should detect right movement from arrow key', () => {
      const handler = new InputHandler(mockScene);
      handler.cursors.right.isDown = true;
      
      const input = handler.getMovementInput();
      
      expect(input.right).toBe(true);
    });

    test('should detect right movement from D key', () => {
      const handler = new InputHandler(mockScene);
      handler.keys.D.isDown = true;
      
      const input = handler.getMovementInput();
      
      expect(input.right).toBe(true);
    });

    test('should combine arrow and WASD input', () => {
      const handler = new InputHandler(mockScene);
      handler.cursors.up.isDown = true;
      handler.keys.D.isDown = true;
      
      const input = handler.getMovementInput();
      
      expect(input.up).toBe(true);
      expect(input.right).toBe(true);
    });

    test('should return all false when no movement keys pressed', () => {
      const handler = new InputHandler(mockScene);
      
      const input = handler.getMovementInput();
      
      expect(input.up).toBe(false);
      expect(input.down).toBe(false);
      expect(input.left).toBe(false);
      expect(input.right).toBe(false);
    });
  });

  describe('Action Input', () => {
    test('should detect spacebar press', () => {
      const handler = new InputHandler(mockScene);
      handler.keys.SPACE.isDown = true;
      
      expect(handler.isInteractPressed()).toBe(true);
    });

    test('should not detect interact when spacebar not pressed', () => {
      const handler = new InputHandler(mockScene);
      handler.keys.SPACE.isDown = false;
      
      expect(handler.isInteractPressed()).toBe(false);
    });

    test('should detect spacebar just pressed', () => {
      const handler = new InputHandler(mockScene);
      handler.keys.SPACE = {
        isDown: true,
        getDuration: jest.fn(() => 1)
      };
      
      expect(handler.isInteractJustPressed()).toBe(true);
    });

    test('should not trigger just pressed for held key', () => {
      const handler = new InputHandler(mockScene);
      handler.keys.SPACE = {
        isDown: true,
        getDuration: jest.fn(() => 500)
      };
      
      expect(handler.isInteractJustPressed()).toBe(false);
    });
  });

  describe('Pause Input', () => {
    test('should detect ESC key press', () => {
      const handler = new InputHandler(mockScene);
      handler.keys.ESC = { isDown: true };
      
      expect(handler.isPausePressed()).toBe(true);
    });

    test('should register pause callback', () => {
      const handler = new InputHandler(mockScene);
      const callback = jest.fn();
      
      handler.onPause(callback);
      
      expect(mockScene.input.keyboard.once).toHaveBeenCalledWith(
        'keydown-ESC',
        callback
      );
    });
  });

  describe('Input State', () => {
    test('should report if any movement key is pressed', () => {
      const handler = new InputHandler(mockScene);
      handler.cursors.up.isDown = true;
      
      expect(handler.hasMovementInput()).toBe(true);
    });

    test('should report no movement when all keys released', () => {
      const handler = new InputHandler(mockScene);
      
      expect(handler.hasMovementInput()).toBe(false);
    });

    test('should calculate movement direction vector', () => {
      const handler = new InputHandler(mockScene);
      handler.cursors.right.isDown = true;
      handler.cursors.up.isDown = true;
      
      const direction = handler.getMovementDirection();
      
      expect(direction.x).toBeGreaterThan(0);
      expect(direction.y).toBeLessThan(0);
    });

    test('should normalize diagonal direction vector', () => {
      const handler = new InputHandler(mockScene);
      handler.cursors.right.isDown = true;
      handler.cursors.down.isDown = true;
      
      const direction = handler.getMovementDirection();
      const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
      
      expect(magnitude).toBeCloseTo(1, 5);
    });

    test('should return zero vector when no input', () => {
      const handler = new InputHandler(mockScene);
      
      const direction = handler.getMovementDirection();
      
      expect(direction.x).toBe(0);
      expect(direction.y).toBe(0);
    });
  });

  describe('Input Blocking', () => {
    test('should block all input when disabled', () => {
      const handler = new InputHandler(mockScene);
      handler.cursors.up.isDown = true;
      handler.keys.SPACE.isDown = true;
      
      handler.disable();
      
      expect(handler.getMovementInput().up).toBe(false);
      expect(handler.isInteractPressed()).toBe(false);
    });

    test('should restore input when enabled', () => {
      const handler = new InputHandler(mockScene);
      handler.disable();
      handler.enable();
      
      handler.cursors.up.isDown = true;
      
      expect(handler.getMovementInput().up).toBe(true);
    });

    test('should report enabled state', () => {
      const handler = new InputHandler(mockScene);
      
      expect(handler.isEnabled()).toBe(true);
      
      handler.disable();
      expect(handler.isEnabled()).toBe(false);
      
      handler.enable();
      expect(handler.isEnabled()).toBe(true);
    });
  });

  describe('Event Callbacks', () => {
    test('should register interact callback', () => {
      const handler = new InputHandler(mockScene);
      const callback = jest.fn();
      
      handler.onInteract(callback);
      
      expect(mockScene.input.keyboard.on).toHaveBeenCalledWith(
        'keydown-SPACE',
        callback
      );
    });

    test('should unregister callbacks on cleanup', () => {
      const handler = new InputHandler(mockScene);
      const callback = jest.fn();
      handler.onInteract(callback);
      
      mockScene.input.keyboard.off = jest.fn();
      handler.cleanup();
      
      expect(mockScene.input.keyboard.off).toHaveBeenCalled();
    });

    test('should trigger callback on spacebar press', () => {
      const handler = new InputHandler(mockScene);
      const callback = jest.fn();
      
      handler.onInteract(callback);
      
      // Simulate the keyboard event
      const spaceHandler = mockScene.input.keyboard.on.mock.calls.find(
        call => call[0] === 'keydown-SPACE'
      )[1];
      spaceHandler();
      
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Update Loop', () => {
    test('should update input state each frame', () => {
      const handler = new InputHandler(mockScene);
      
      expect(() => handler.update()).not.toThrow();
    });

    test('should clear just-pressed flags after update', () => {
      const handler = new InputHandler(mockScene);
      handler.keys.SPACE = {
        isDown: true,
        getDuration: jest.fn(() => 1)
      };
      
      expect(handler.isInteractJustPressed()).toBe(true);
      handler.update();
      
      handler.keys.SPACE.getDuration = jest.fn(() => 100);
      expect(handler.isInteractJustPressed()).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    test('should format input state as string', () => {
      const handler = new InputHandler(mockScene);
      handler.cursors.up.isDown = true;
      handler.cursors.right.isDown = true;
      
      const state = handler.getInputStateString();
      
      expect(state).toContain('up');
      expect(state).toContain('right');
    });

    test('should reset all input state', () => {
      const handler = new InputHandler(mockScene);
      handler.cursors.up.isDown = true;
      handler.keys.SPACE.isDown = true;
      
      handler.reset();
      
      const input = handler.getMovementInput();
      expect(input.up).toBe(false);
      expect(handler.isInteractPressed()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing cursor keys gracefully', () => {
      const handler = new InputHandler(mockScene);
      handler.cursors = null;
      
      expect(() => handler.getMovementInput()).not.toThrow();
    });

    test('should handle missing WASD keys gracefully', () => {
      const handler = new InputHandler(mockScene);
      handler.keys = {};
      
      expect(() => handler.getMovementInput()).not.toThrow();
    });

    test('should handle rapid enable/disable toggling', () => {
      const handler = new InputHandler(mockScene);
      
      for (let i = 0; i < 100; i++) {
        handler.disable();
        handler.enable();
      }
      
      expect(handler.isEnabled()).toBe(true);
    });
  });
});
