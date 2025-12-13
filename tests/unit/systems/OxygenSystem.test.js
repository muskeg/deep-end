/**
 * Unit Tests for OxygenSystem
 * TDD: Write tests first, then implement OxygenSystem class
 */

import { OXYGEN_CONFIG, PLAYER_CONFIG } from '../../../src/utils/Constants.js';

describe('OxygenSystem', () => {
  let mockScene;
  let mockPlayer;
  let OxygenSystem;

  beforeEach(async () => {
    const module = await import('../../../src/systems/OxygenSystem.js');
    OxygenSystem = module.default;

    mockScene = {
      events: {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn()
      },
      time: {
        now: 0
      }
    };

    mockPlayer = {
      oxygen: PLAYER_CONFIG.INITIAL_OXYGEN,
      updateOxygen: jest.fn(),
      isAlive: jest.fn(() => true)
    };
  });

  describe('Initialization', () => {
    test('should create oxygen system with scene and player', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      
      expect(system.scene).toBe(mockScene);
      expect(system.player).toBe(mockPlayer);
    });

    test('should initialize with base depletion rate', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      
      expect(system.depletionRate).toBe(OXYGEN_CONFIG.BASE_DEPLETION_RATE);
    });

    test('should track system activation state', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      
      expect(system.isActive).toBe(true);
    });
  });

  describe('Oxygen Depletion', () => {
    test('should deplete oxygen over time', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      const deltaSeconds = 1.0;
      
      system.update(deltaSeconds);
      
      expect(mockPlayer.updateOxygen).toHaveBeenCalledWith(deltaSeconds);
    });

    test('should use base depletion rate by default', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      
      expect(system.getDepletionRate()).toBe(OXYGEN_CONFIG.BASE_DEPLETION_RATE);
    });

    test('should apply multiplier for difficult terrain', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      
      system.setTerrainMultiplier(OXYGEN_CONFIG.DIFFICULT_TERRAIN_MULTIPLIER);
      
      expect(system.getDepletionRate()).toBe(
        OXYGEN_CONFIG.BASE_DEPLETION_RATE * OXYGEN_CONFIG.DIFFICULT_TERRAIN_MULTIPLIER
      );
    });

    test('should reset to base rate when terrain multiplier cleared', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      
      system.setTerrainMultiplier(2.0);
      system.setTerrainMultiplier(1.0);
      
      expect(system.getDepletionRate()).toBe(OXYGEN_CONFIG.BASE_DEPLETION_RATE);
    });

    test('should not deplete when system is paused', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      
      system.pause();
      system.update(1.0);
      
      expect(mockPlayer.updateOxygen).not.toHaveBeenCalled();
    });

    test('should resume depletion after unpause', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      
      system.pause();
      system.resume();
      system.update(1.0);
      
      expect(mockPlayer.updateOxygen).toHaveBeenCalled();
    });
  });

  describe('Warning Thresholds', () => {
    test('should emit warning when oxygen drops below threshold', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      mockPlayer.oxygen = OXYGEN_CONFIG.WARNING_THRESHOLD - 1;
      
      system.checkThresholds();
      
      expect(mockScene.events.emit).toHaveBeenCalledWith(
        'oxygen-warning',
        expect.any(Number)
      );
    });

    test('should not emit warning when above threshold', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      mockPlayer.oxygen = OXYGEN_CONFIG.WARNING_THRESHOLD + 1;
      
      system.checkThresholds();
      
      expect(mockScene.events.emit).not.toHaveBeenCalledWith(
        'oxygen-warning',
        expect.any(Number)
      );
    });

    test('should emit warning only once per threshold cross', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      mockPlayer.oxygen = OXYGEN_CONFIG.WARNING_THRESHOLD - 1;
      
      system.checkThresholds();
      system.checkThresholds();
      system.checkThresholds();
      
      const warningCalls = mockScene.events.emit.mock.calls.filter(
        call => call[0] === 'oxygen-warning'
      );
      expect(warningCalls.length).toBe(1);
    });

    test('should re-emit warning if oxygen rises then falls again', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      
      mockPlayer.oxygen = OXYGEN_CONFIG.WARNING_THRESHOLD - 1;
      system.checkThresholds();
      
      mockPlayer.oxygen = OXYGEN_CONFIG.WARNING_THRESHOLD + 10;
      system.checkThresholds();
      
      mockPlayer.oxygen = OXYGEN_CONFIG.WARNING_THRESHOLD - 1;
      system.checkThresholds();
      
      const warningCalls = mockScene.events.emit.mock.calls.filter(
        call => call[0] === 'oxygen-warning'
      );
      expect(warningCalls.length).toBe(2);
    });
  });

  describe('Game Over Trigger', () => {
    test('should emit game-over event when oxygen depleted', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      mockPlayer.oxygen = 0;
      mockPlayer.isAlive = jest.fn(() => false);
      
      system.checkGameOver();
      
      expect(mockScene.events.emit).toHaveBeenCalledWith('game-over', { reason: 'oxygen-depleted' });
    });

    test('should not emit game-over when oxygen > 0', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      mockPlayer.oxygen = 1;
      
      system.checkGameOver();
      
      expect(mockScene.events.emit).not.toHaveBeenCalledWith(
        'game-over',
        expect.anything()
      );
    });

    test('should emit game-over only once', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      mockPlayer.oxygen = 0;
      mockPlayer.isAlive = jest.fn(() => false);
      
      system.checkGameOver();
      system.checkGameOver();
      system.checkGameOver();
      
      const gameOverCalls = mockScene.events.emit.mock.calls.filter(
        call => call[0] === 'game-over'
      );
      expect(gameOverCalls.length).toBe(1);
    });

    test('should stop updating after game over', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      mockPlayer.oxygen = 0;
      mockPlayer.isAlive = jest.fn(() => false);
      
      system.checkGameOver();
      system.update(1.0);
      
      expect(mockPlayer.updateOxygen).not.toHaveBeenCalled();
    });
  });

  describe('Enemy Collision Damage', () => {
    test('should apply instant oxygen loss on enemy hit', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      mockPlayer.oxygen = 50;
      
      system.handleEnemyCollision();
      
      const expectedOxygen = 50 - OXYGEN_CONFIG.ENEMY_COLLISION_DAMAGE;
      expect(mockPlayer.oxygen).toBe(expectedOxygen);
    });

    test('should emit oxygen-damage event', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      
      system.handleEnemyCollision();
      
      expect(mockScene.events.emit).toHaveBeenCalledWith(
        'oxygen-damage',
        OXYGEN_CONFIG.ENEMY_COLLISION_DAMAGE
      );
    });

    test('should not reduce oxygen below zero on collision', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      mockPlayer.oxygen = 5;
      
      system.handleEnemyCollision();
      
      expect(mockPlayer.oxygen).toBeGreaterThanOrEqual(0);
    });

    test('should trigger game over if collision depletes all oxygen', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      mockPlayer.oxygen = 5;
      mockPlayer.isAlive = jest.fn(() => false);
      
      system.handleEnemyCollision();
      system.checkGameOver();
      
      expect(mockScene.events.emit).toHaveBeenCalledWith('game-over', expect.any(Object));
    });
  });

  describe('Statistics Tracking', () => {
    test('should track total oxygen consumed', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      const initialOxygen = mockPlayer.oxygen;
      
      system.update(1.0);
      system.update(1.0);
      
      expect(system.getTotalOxygenConsumed()).toBeGreaterThan(0);
    });

    test('should track time underwater', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      
      system.update(1.0);
      system.update(0.5);
      
      expect(system.getTimeUnderwater()).toBe(1.5);
    });

    test('should not count paused time', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      
      system.update(1.0);
      system.pause();
      system.update(1.0);
      system.resume();
      system.update(1.0);
      
      expect(system.getTimeUnderwater()).toBe(2.0);
    });
  });

  describe('Reset Functionality', () => {
    test('should reset oxygen to full', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      mockPlayer.oxygen = 50;
      
      system.reset();
      
      expect(mockPlayer.oxygen).toBe(PLAYER_CONFIG.INITIAL_OXYGEN);
    });

    test('should clear warning state', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      mockPlayer.oxygen = OXYGEN_CONFIG.WARNING_THRESHOLD - 1;
      system.checkThresholds();
      
      system.reset(); // Resets warningEmitted and player.oxygen to 100%
      mockScene.events.emit.mockClear();
      
      // Drop oxygen below threshold again to trigger warning
      mockPlayer.oxygen = OXYGEN_CONFIG.WARNING_THRESHOLD - 1;
      system.checkThresholds();
      
      expect(mockScene.events.emit).toHaveBeenCalledWith('oxygen-warning', expect.any(Number));
    });

    test('should reset statistics', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      system.update(5.0);
      
      system.reset();
      
      expect(system.getTotalOxygenConsumed()).toBe(0);
      expect(system.getTimeUnderwater()).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very large delta times', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      
      expect(() => system.update(100)).not.toThrow();
    });

    test('should handle zero delta time', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      
      system.update(0);
      
      expect(mockPlayer.updateOxygen).toHaveBeenCalledWith(0);
    });

    test('should handle negative multiplier gracefully', () => {
      const system = new OxygenSystem(mockScene, mockPlayer);
      
      system.setTerrainMultiplier(-1);
      
      expect(system.getDepletionRate()).toBeGreaterThanOrEqual(0);
    });
  });
});
