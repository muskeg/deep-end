/**
 * DifficultySystem
 * Manages difficulty scaling across levels
 * Provides balanced progression curves for all game parameters
 */
export default class DifficultySystem {
  constructor() {
    // Base values for level 1
    this.baseClams = 3;
    this.baseCurrents = 2;
    this.baseJellyfish = 1;
    this.baseEels = 0; // Eels start at level 2
    this.baseOxygenRate = 1.0;
    this.baseDensity = 0.40;
    this.baseIterations = 5;
    this.baseMinOpenSpace = 0.50;
    
    // Maximum caps to prevent impossible difficulty
    this.maxClams = 10;
    this.maxCurrents = 8;
    this.maxJellyfish = 5;
    this.maxEels = 3;
    this.maxOxygenRate = 2.5;
    this.maxDensity = 0.55;
    this.maxMinOpenSpace = 0.40; // Minimum open space (inverse relationship)
  }

  /**
   * Get number of clams (pearls to collect) for a level
   * Increases gradually: +1 every 2 levels
   */
  getClamCount(level) {
    level = Math.max(1, level); // Ensure level >= 1
    const scaled = this.baseClams + Math.floor((level - 1) / 2);
    return Math.min(scaled, this.maxClams);
  }

  /**
   * Get number of water currents for a level
   * Increases gradually: +1 every 3 levels
   */
  getCurrentCount(level) {
    level = Math.max(1, level);
    const scaled = this.baseCurrents + Math.floor((level - 1) / 3);
    return Math.min(scaled, this.maxCurrents);
  }

  /**
   * Get number of jellyfish enemies for a level
   * Increases gradually: +1 every 4 levels
   */
  getJellyfishCount(level) {
    level = Math.max(1, level);
    const scaled = this.baseJellyfish + Math.floor((level - 1) / 4);
    return Math.min(scaled, this.maxJellyfish);
  }

  /**
   * Get number of eel enemies for a level
   * Starts at level 2, increases slowly: +1 every 5 levels
   */
  getEelCount(level) {
    level = Math.max(1, level);
    if (level < 2) return 0;
    const scaled = 1 + Math.floor((level - 2) / 5);
    return Math.min(scaled, this.maxEels);
  }

  /**
   * Get oxygen depletion rate multiplier for a level
   * Increases gradually using logarithmic curve
   * Level 1: 1.0x, Level 10: ~1.5x, Level 50: ~2.5x
   */
  getOxygenDepletionRate(level) {
    level = Math.max(1, level);
    // Logarithmic scaling: slower increase at higher levels
    const scaled = this.baseOxygenRate + (Math.log(level) * 0.3);
    return Math.min(scaled, this.maxOxygenRate);
  }

  /**
   * Get cavern generation complexity parameters for a level
   * Returns { density, iterations, minOpenSpace }
   * 
   * Density increases (more walls, tighter spaces)
   * MinOpenSpace decreases slightly (but stays solvable)
   * Iterations stay constant for consistent cave quality
   */
  getCavernComplexity(level) {
    level = Math.max(1, level);
    
    // Density increases gradually: +0.01 every 5 levels
    const densityIncrease = Math.floor((level - 1) / 5) * 0.01;
    const density = Math.min(
      this.baseDensity + densityIncrease,
      this.maxDensity
    );
    
    // MinOpenSpace decreases slightly: -0.01 every 10 levels
    const openSpaceDecrease = Math.floor((level - 1) / 10) * 0.01;
    const minOpenSpace = Math.max(
      this.baseMinOpenSpace - openSpaceDecrease,
      this.maxMinOpenSpace
    );
    
    // Iterations stay constant for quality
    const iterations = this.baseIterations;
    
    return {
      density,
      iterations,
      minOpenSpace
    };
  }

  /**
   * Get complete difficulty configuration for a level
   * Convenience method that returns all parameters at once
   */
  getDifficultyConfig(level) {
    return {
      clams: this.getClamCount(level),
      currents: this.getCurrentCount(level),
      jellyfish: this.getJellyfishCount(level),
      eels: this.getEelCount(level),
      oxygenRate: this.getOxygenDepletionRate(level),
      cavern: this.getCavernComplexity(level),
      level
    };
  }

  /**
   * Get human-readable difficulty description for a level
   */
  getDifficultyLabel(level) {
    if (level === 1) return 'Tutorial';
    if (level <= 3) return 'Easy';
    if (level <= 7) return 'Normal';
    if (level <= 12) return 'Hard';
    if (level <= 20) return 'Expert';
    return 'Master';
  }
}
