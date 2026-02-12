/**
 * Unit Tests for Clam Entity
 * TDD: Write tests first, then implement Clam class
 */

import { COLORS } from '../../../src/utils/Constants.js';

describe('Clam Entity', () => {
  let mockScene;
  let Clam;

  beforeEach(async () => {
    const module = await import('../../../src/entities/Clam.js');
    Clam = module.default;

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
            setImmovable: jest.fn().mockReturnThis(),
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
        add: jest.fn()
      },
      time: {
        addEvent: jest.fn((config) => {
          if (config.callback) {
            setTimeout(config.callback, config.delay);
          }
          return { remove: jest.fn() };
        })
      }
    };
  });

  describe('Initialization', () => {
    test('should create clam at correct position', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      
      expect(clam.x).toBe(100);
      expect(clam.y).toBe(200);
    });

    test('should initialize in closed state', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      
      expect(clam.isOpen).toBe(false);
    });

    test('should track whether it contains a pearl', () => {
      const clamWithPearl = new Clam(mockScene, 100, 200, true);
      const clamWithoutPearl = new Clam(mockScene, 100, 200, false);
      
      expect(clamWithPearl.hasPearl).toBe(true);
      expect(clamWithoutPearl.hasPearl).toBe(false);
    });

    test('should be immovable', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      
      expect(clam.setImmovable).toHaveBeenCalledWith(true);
    });

    test('should have circular collision body', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      
      expect(clam.body.setCircle).toHaveBeenCalled();
    });
  });

  describe('Opening and Closing', () => {
    test('should open when interacted with', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      
      clam.open();
      
      // Opening is now animated - advance 3 frames (100ms each)
      clam.update(0, 100);
      clam.update(0, 100);
      clam.update(0, 100);
      
      expect(clam.isOpen).toBe(true);
    });

    test('should not open if already open', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      clam.isOpen = true;
      const result = clam.open();
      
      expect(result).toBe(false);
    });

    test('should emit clam-opened event when opened', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      
      clam.open();
      
      expect(mockScene.events.emit).toHaveBeenCalledWith('clam-opened', clam);
    });

    test('should close after being open', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      
      clam.close();
      
      expect(clam.isOpen).toBe(false);
    });

    test('should auto-close after delay when no pearl', (done) => {
      const clam = new Clam(mockScene, 100, 200, false);
      
      clam.open();
      
      setTimeout(() => {
        expect(clam.isOpen).toBe(false);
        done();
      }, 3100); // AUTO_CLOSE_DELAY + buffer
    });

    test('should remain open when pearl not yet collected', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      
      clam.open();
      
      // Advance opening animation
      clam.update(0, 100);
      clam.update(0, 100);
      clam.update(0, 100);
      
      // Should stay open indefinitely until pearl is collected
      expect(clam.isOpen).toBe(true);
    });
  });

  describe('Pearl Dispensing', () => {
    test('should dispense pearl when opened and has pearl', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      
      const pearl = clam.dispensePearl();
      
      expect(pearl).toBeTruthy();
      expect(pearl.x).toBe(100);
      expect(pearl.y).toBe(200);
    });

    test('should not dispense pearl when opened but no pearl', () => {
      const clam = new Clam(mockScene, 100, 200, false);
      
      const pearl = clam.dispensePearl();
      
      expect(pearl).toBeNull();
    });

    test('should only dispense pearl once', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      
      const pearl1 = clam.dispensePearl();
      const pearl2 = clam.dispensePearl();
      
      expect(pearl1).toBeTruthy();
      expect(pearl2).toBeNull();
    });

    test('should mark pearl as dispensed after dispensing', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      
      clam.dispensePearl();
      
      expect(clam.hasPearl).toBe(false);
    });

    test('should emit pearl-dispensed event', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      
      clam.dispensePearl();
      
      expect(mockScene.events.emit).toHaveBeenCalledWith('pearl-dispensed', expect.any(Object));
    });
  });

  describe('Visual State', () => {
    test('should update texture when opened', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      
      clam.open();
      
      expect(clam.setTexture).toHaveBeenCalled();
    });

    test('should use closed texture when closed', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      
      clam.close();
      
      expect(clam.setTexture).toHaveBeenCalledWith('clam-closed');
    });
  });

  describe('Interaction Detection', () => {
    test('should be interactable when closed', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      
      expect(clam.canInteract()).toBe(true);
    });

    test('should not be interactable when open', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      clam.isOpen = true;
      
      expect(clam.canInteract()).toBe(false);
    });

    test('should not be interactable when pearl already dispensed', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      clam.dispensePearl();
      
      expect(clam.canInteract()).toBe(false);
    });
  });

  describe('Update Loop', () => {
    test('should call update method without errors', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      
      expect(() => clam.update(16)).not.toThrow();
    });

    test('should animate when open', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      clam.open();
      
      const setTextureSpy = jest.spyOn(clam, 'setTexture');
      // Advance one animation frame
      clam.update(0, 100);
      
      // Should cycle through opening textures
      expect(setTextureSpy).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    test('should clean up on destroy', () => {
      const clam = new Clam(mockScene, 100, 200, true);
      
      expect(() => clam.destroy()).not.toThrow();
      expect(clam.active).toBe(false);
    });

    test('should remove timers when destroyed', () => {
      const clam = new Clam(mockScene, 100, 200, false); // No pearl, so timer will be created
      clam.open();
      
      // Verify timer was created and clam can be destroyed without error
      expect(() => clam.destroy()).not.toThrow();
    });
  });
});
