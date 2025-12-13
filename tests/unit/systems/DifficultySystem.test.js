import DifficultySystem from '../../../src/systems/DifficultySystem.js';

describe('DifficultySystem', () => {
  describe('initialization', () => {
    test('creates system with default difficulty curve', () => {
      const system = new DifficultySystem();
      expect(system).toBeDefined();
    });
  });

  describe('getClamCount', () => {
    test('returns base clam count for level 1', () => {
      const system = new DifficultySystem();
      const count = system.getClamCount(1);
      expect(count).toBe(3);
    });

    test('increases clam count gradually with level', () => {
      const system = new DifficultySystem();
      const level1 = system.getClamCount(1);
      const level3 = system.getClamCount(3);
      const level5 = system.getClamCount(5);
      
      expect(level3).toBeGreaterThan(level1);
      expect(level5).toBeGreaterThan(level3);
    });

    test('caps clam count at maximum', () => {
      const system = new DifficultySystem();
      const level50 = system.getClamCount(50);
      const level100 = system.getClamCount(100);
      
      // Should eventually cap
      expect(level100).toBeLessThanOrEqual(10);
    });
  });

  describe('getCurrentCount', () => {
    test('returns base current count for level 1', () => {
      const system = new DifficultySystem();
      const count = system.getCurrentCount(1);
      expect(count).toBe(2);
    });

    test('increases current count with level', () => {
      const system = new DifficultySystem();
      const level1 = system.getCurrentCount(1);
      const level5 = system.getCurrentCount(5);
      
      expect(level5).toBeGreaterThan(level1);
    });

    test('caps current count at maximum', () => {
      const system = new DifficultySystem();
      const level50 = system.getCurrentCount(50);
      
      expect(level50).toBeLessThanOrEqual(8);
    });
  });

  describe('getJellyfishCount', () => {
    test('returns base jellyfish count for level 1', () => {
      const system = new DifficultySystem();
      const count = system.getJellyfishCount(1);
      expect(count).toBe(1);
    });

    test('increases jellyfish count with level', () => {
      const system = new DifficultySystem();
      const level1 = system.getJellyfishCount(1);
      const level10 = system.getJellyfishCount(10);
      
      expect(level10).toBeGreaterThan(level1);
    });

    test('caps jellyfish count', () => {
      const system = new DifficultySystem();
      const level50 = system.getJellyfishCount(50);
      
      expect(level50).toBeLessThanOrEqual(5);
    });
  });

  describe('getEelCount', () => {
    test('returns 0 eels for level 1', () => {
      const system = new DifficultySystem();
      const count = system.getEelCount(1);
      expect(count).toBe(0);
    });

    test('returns eels starting at level 2', () => {
      const system = new DifficultySystem();
      const count = system.getEelCount(2);
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('increases eel count with level', () => {
      const system = new DifficultySystem();
      const level2 = system.getEelCount(2);
      const level10 = system.getEelCount(10);
      
      expect(level10).toBeGreaterThanOrEqual(level2);
    });

    test('caps eel count', () => {
      const system = new DifficultySystem();
      const level50 = system.getEelCount(50);
      
      expect(level50).toBeLessThanOrEqual(3);
    });
  });

  describe('getOxygenDepletionRate', () => {
    test('returns base rate for level 1', () => {
      const system = new DifficultySystem();
      const rate = system.getOxygenDepletionRate(1);
      expect(rate).toBe(1.0);
    });

    test('increases depletion rate with level', () => {
      const system = new DifficultySystem();
      const level1 = system.getOxygenDepletionRate(1);
      const level5 = system.getOxygenDepletionRate(5);
      const level10 = system.getOxygenDepletionRate(10);
      
      expect(level5).toBeGreaterThan(level1);
      expect(level10).toBeGreaterThan(level5);
    });

    test('caps depletion rate at maximum', () => {
      const system = new DifficultySystem();
      const level50 = system.getOxygenDepletionRate(50);
      
      // Should cap at reasonable maximum (e.g., 2.5x base rate)
      expect(level50).toBeLessThanOrEqual(2.5);
    });
  });

  describe('getCavernComplexity', () => {
    test('returns base complexity for level 1', () => {
      const system = new DifficultySystem();
      const complexity = system.getCavernComplexity(1);
      expect(complexity).toHaveProperty('density');
      expect(complexity).toHaveProperty('iterations');
      expect(complexity).toHaveProperty('minOpenSpace');
    });

    test('increases density with level (more walls)', () => {
      const system = new DifficultySystem();
      const level1 = system.getCavernComplexity(1);
      const level10 = system.getCavernComplexity(10);
      
      expect(level10.density).toBeGreaterThan(level1.density);
    });

    test('maintains minimum open space for solvability', () => {
      const system = new DifficultySystem();
      const level50 = system.getCavernComplexity(50);
      
      // Must maintain at least 40% open space to be solvable
      expect(level50.minOpenSpace).toBeGreaterThanOrEqual(0.4);
    });

    test('caps density to prevent impossible levels', () => {
      const system = new DifficultySystem();
      const level100 = system.getCavernComplexity(100);
      
      // Density should not exceed 0.55 (55% walls)
      expect(level100.density).toBeLessThanOrEqual(0.55);
    });
  });

  describe('edge cases', () => {
    test('handles level 0 as level 1', () => {
      const system = new DifficultySystem();
      const level0 = system.getClamCount(0);
      const level1 = system.getClamCount(1);
      
      expect(level0).toBe(level1);
    });

    test('handles negative levels as level 1', () => {
      const system = new DifficultySystem();
      const levelNeg = system.getClamCount(-5);
      const level1 = system.getClamCount(1);
      
      expect(levelNeg).toBe(level1);
    });

    test('handles very high levels gracefully', () => {
      const system = new DifficultySystem();
      const level1000 = system.getClamCount(1000);
      
      expect(level1000).toBeGreaterThan(0);
      expect(level1000).toBeLessThan(100);
    });
  });

  describe('difficulty progression', () => {
    test('maintains reasonable difficulty curve across 20 levels', () => {
      const system = new DifficultySystem();
      
      for (let level = 1; level <= 20; level++) {
        const clams = system.getClamCount(level);
        const enemies = system.getJellyfishCount(level) + system.getEelCount(level);
        const oxygenRate = system.getOxygenDepletionRate(level);
        
        // Verify all values are reasonable
        expect(clams).toBeGreaterThanOrEqual(3);
        expect(clams).toBeLessThanOrEqual(10);
        expect(enemies).toBeGreaterThanOrEqual(1);
        expect(enemies).toBeLessThanOrEqual(8);
        expect(oxygenRate).toBeGreaterThanOrEqual(1.0);
        expect(oxygenRate).toBeLessThanOrEqual(2.5);
      }
    });

    test('difficulty increases are noticeable but not overwhelming', () => {
      const system = new DifficultySystem();
      
      // Compare consecutive levels - should increase gradually
      for (let level = 1; level < 10; level++) {
        const currentClams = system.getClamCount(level);
        const nextClams = system.getClamCount(level + 1);
        
        // Either stays same or increases by 1
        expect(nextClams - currentClams).toBeLessThanOrEqual(1);
      }
    });
  });
});
