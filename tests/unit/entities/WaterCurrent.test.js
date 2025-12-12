/**
 * Unit Tests for WaterCurrent Entity
 * TDD: Write tests first, then implement WaterCurrent class
 */

import { CURRENT_CONFIG } from '../../../src/utils/Constants.js';

describe('WaterCurrent Entity', () => {
  let mockScene;
  let WaterCurrent;

  beforeEach(async () => {
    const module = await import('../../../src/entities/WaterCurrent.js');
    WaterCurrent = module.default;

    mockScene = {
      add: {
        sprite: jest.fn(() => ({})),
        existing: jest.fn(),
        graphics: jest.fn(() => ({
          clear: jest.fn().mockReturnThis(),
          fillStyle: jest.fn().mockReturnThis(),
          fillRect: jest.fn().mockReturnThis(),
          fillTriangle: jest.fn().mockReturnThis(),
          lineStyle: jest.fn().mockReturnThis(),
          beginPath: jest.fn().mockReturnThis(),
          moveTo: jest.fn().mockReturnThis(),
          lineTo: jest.fn().mockReturnThis(),
          strokePath: jest.fn().mockReturnThis(),
          setAlpha: jest.fn().mockReturnThis(),
          destroy: jest.fn()
        }))
      },
      physics: {
        add: {
          sprite: jest.fn(() => ({
            body: {
              setSize: jest.fn()
            }
          })),
          existing: jest.fn()
        }
      }
    };
  });

  describe('Initialization', () => {
    test('should create current at correct position', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 150, { x: 1, y: 0 });
      
      expect(current.x).toBe(200);
      expect(current.y).toBe(300);
    });

    test('should have correct dimensions', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 150, { x: 1, y: 0 });
      
      expect(current.width).toBe(100);
      expect(current.height).toBe(150);
    });

    test('should normalize direction vector', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 150, { x: 3, y: 4 });
      
      const length = Math.sqrt(current.direction.x ** 2 + current.direction.y ** 2);
      expect(length).toBeCloseTo(1.0, 2);
    });

    test('should have default strength', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 150, { x: 1, y: 0 });
      
      expect(current.strength).toBe(CURRENT_CONFIG.DEFAULT_STRENGTH);
    });

    test('should accept custom strength', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 150, { x: 1, y: 0 }, 200);
      
      expect(current.strength).toBe(200);
    });

    test('should be active by default', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 150, { x: 1, y: 0 });
      
      expect(current.isActive).toBe(true);
    });
  });

  describe('Range Detection', () => {
    test('should detect entity within range', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 100, { x: 1, y: 0 });
      const entity = { x: 220, y: 320 };
      
      expect(current.isEntityInRange(entity)).toBe(true);
    });

    test('should not detect entity outside range', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 100, { x: 1, y: 0 });
      const entity = { x: 400, y: 500 };
      
      expect(current.isEntityInRange(entity)).toBe(false);
    });

    test('should detect entity at edge of range', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 100, { x: 1, y: 0 });
      const entity = { x: 250, y: 350 }; // Right at boundary
      
      expect(current.isEntityInRange(entity)).toBe(true);
    });

    test('should not affect entities when inactive', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 100, { x: 1, y: 0 });
      current.setActive(false);
      const entity = { x: 220, y: 320 };
      
      expect(current.isEntityInRange(entity)).toBe(false);
    });
  });

  describe('Force Calculation', () => {
    test('should calculate force in correct direction', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 100, { x: 1, y: 0 }, 100);
      
      const force = current.getForce();
      
      expect(force.x).toBeCloseTo(100, 1);
      expect(force.y).toBeCloseTo(0, 1);
    });

    test('should scale force by strength', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 100, { x: 1, y: 0 }, 300);
      
      const force = current.getForce();
      
      expect(force.x).toBeCloseTo(300, 1);
    });

    test('should return zero force when inactive', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 100, { x: 1, y: 0 }, 100);
      current.setActive(false);
      
      const force = current.getForce();
      
      expect(force.x).toBe(0);
      expect(force.y).toBe(0);
    });

    test('should handle diagonal currents correctly', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 100, { x: 1, y: 1 }, 100);
      
      const force = current.getForce();
      
      // Diagonal force should be ~70.7 in each direction for strength 100
      expect(force.x).toBeCloseTo(70.7, 1);
      expect(force.y).toBeCloseTo(70.7, 1);
    });
  });

  describe('State Management', () => {
    test('should activate current', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 100, { x: 1, y: 0 });
      current.setActive(false);
      
      current.setActive(true);
      
      expect(current.isActive).toBe(true);
    });

    test('should deactivate current', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 100, { x: 1, y: 0 });
      
      current.setActive(false);
      
      expect(current.isActive).toBe(false);
    });

    test('should allow strength modification', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 100, { x: 1, y: 0 }, 100);
      
      current.setStrength(200);
      
      expect(current.strength).toBe(200);
      expect(current.getForce().x).toBeCloseTo(200, 1);
    });

    test('should allow direction modification', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 100, { x: 1, y: 0 });
      
      current.setDirection({ x: 0, y: 1 });
      
      const force = current.getForce();
      expect(force.x).toBeCloseTo(0, 1);
      expect(force.y).toBeCloseTo(CURRENT_CONFIG.DEFAULT_STRENGTH, 1);
    });
  });

  describe('Visual Updates', () => {
    test('should update visuals when direction changes', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 100, { x: 1, y: 0 });
      const updateSpy = jest.spyOn(current, 'updateVisuals');
      
      current.setDirection({ x: 0, y: 1 });
      
      expect(updateSpy).toHaveBeenCalled();
    });

    test('should update visuals when strength changes', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 100, { x: 1, y: 0 });
      const updateSpy = jest.spyOn(current, 'updateVisuals');
      
      current.setStrength(200);
      
      expect(updateSpy).toHaveBeenCalled();
    });

    test('should update visuals when activated', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 100, { x: 1, y: 0 });
      current.setActive(false);
      const updateSpy = jest.spyOn(current, 'updateVisuals');
      
      current.setActive(true);
      
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    test('should clean up graphics on destroy', () => {
      const current = new WaterCurrent(mockScene, 200, 300, 100, 100, { x: 1, y: 0 });
      const graphicsDestroySpy = jest.spyOn(current.graphics, 'destroy');
      
      current.destroy();
      
      expect(graphicsDestroySpy).toHaveBeenCalled();
    });
  });
});
