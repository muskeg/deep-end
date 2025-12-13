import { CAVERN_CONFIG } from '../utils/Constants.js';

/**
 * CavernGenerator
 * Procedural cave generation using Cellular Automata algorithm
 * Ensures connectivity and sufficient open space for gameplay
 */
export default class CavernGenerator {
  constructor(width, height, density = CAVERN_CONFIG.INITIAL_DENSITY) {
    this.width = width;
    this.height = height;
    this.initialDensity = density;
    this.grid = [];
    this.rng = null; // Seeded random number generator
  }

  /**
   * Initialize seeded random number generator
   * @param {number} seed - Random seed for deterministic generation
   */
  setSeed(seed) {
    // Simple seeded RNG using mulberry32
    this.rng = (function() {
      let state = seed;
      return function() {
        state |= 0;
        state = state + 0x6D2B79F5 | 0;
        let t = Math.imul(state ^ state >>> 15, 1 | state);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    })();
  }

  /**
   * Get random number (uses seed if set, otherwise Math.random)
   * @returns {number} Random number between 0 and 1
   */
  random() {
    return this.rng ? this.rng() : Math.random();
  }

  /**
   * Generate initial grid with random walls and spaces
   * @param {number} density - Percentage of walls (0-1)
   */
  generateInitialGrid(density = this.initialDensity) {
    this.grid = [];
    
    for (let y = 0; y < this.height; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.width; x++) {
        // Force borders to be walls
        if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
          this.grid[y][x] = 1;
        } else {
          // Random wall based on density
          this.grid[y][x] = this.random() < density ? 1 : 0;
        }
      }
    }
  }

  /**
   * Count wall neighbors in 3x3 area around cell
   * @param {number} x - Cell x coordinate
   * @param {number} y - Cell y coordinate
   * @returns {number} Count of wall neighbors (0-8)
   */
  countWallNeighbors(x, y) {
    let count = 0;
    
    for (let ny = y - 1; ny <= y + 1; ny++) {
      for (let nx = x - 1; nx <= x + 1; nx++) {
        // Skip center cell
        if (nx === x && ny === y) continue;
        
        // Out of bounds counts as wall
        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) {
          count++;
        } else if (this.grid[ny][nx] === 1) {
          count++;
        }
      }
    }
    
    return count;
  }

  /**
   * Apply cellular automata smoothing
   * Birth threshold: 5+ neighbors = become wall
   * Death threshold: <3 neighbors = become open
   * @param {number} iterations - Number of smoothing passes
   */
  smoothGrid(iterations = CAVERN_CONFIG.ITERATIONS) {
    for (let i = 0; i < iterations; i++) {
      const newGrid = [];
      
      for (let y = 0; y < this.height; y++) {
        newGrid[y] = [];
        for (let x = 0; x < this.width; x++) {
          // Keep borders as walls
          if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
            newGrid[y][x] = 1;
            continue;
          }
          
          const neighbors = this.countWallNeighbors(x, y);
          
          // Apply cellular automata rules
          if (neighbors >= CAVERN_CONFIG.BIRTH_THRESHOLD) {
            newGrid[y][x] = 1; // Birth - become wall
          } else if (neighbors < CAVERN_CONFIG.DEATH_THRESHOLD) {
            newGrid[y][x] = 0; // Death - become open
          } else {
            newGrid[y][x] = this.grid[y][x]; // Stay same
          }
        }
      }
      
      this.grid = newGrid;
    }
  }

  /**
   * Check if all open spaces are connected using flood fill
   * @returns {boolean} True if cavern is fully connected
   */
  isConnected() {
    // Find first open cell
    let startX = -1;
    let startY = -1;
    
    for (let y = 1; y < this.height - 1 && startX === -1; y++) {
      for (let x = 1; x < this.width - 1 && startX === -1; x++) {
        if (this.grid[y][x] === 0) {
          startX = x;
          startY = y;
        }
      }
    }
    
    if (startX === -1) return false; // No open spaces
    
    // Flood fill from start position
    const visited = Array(this.height).fill(null).map(() => Array(this.width).fill(false));
    const queue = [{ x: startX, y: startY }];
    visited[startY][startX] = true;
    let reachableCount = 0;
    
    while (queue.length > 0) {
      const { x, y } = queue.shift();
      reachableCount++;
      
      // Check 4 cardinal directions
      const neighbors = [
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 }
      ];
      
      for (const n of neighbors) {
        if (n.x >= 0 && n.x < this.width && n.y >= 0 && n.y < this.height &&
            !visited[n.y][n.x] && this.grid[n.y][n.x] === 0) {
          visited[n.y][n.x] = true;
          queue.push(n);
        }
      }
    }
    
    // Count total open spaces
    let totalOpen = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.grid[y][x] === 0) totalOpen++;
      }
    }
    
    // Connected if we reached all open spaces
    return reachableCount === totalOpen;
  }

  /**
   * Validate that grid has enough open space for gameplay
   * @returns {boolean} True if open space meets minimum threshold
   */
  validateOpenSpace() {
    let openCount = 0;
    const totalCells = this.width * this.height;
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.grid[y][x] === 0) openCount++;
      }
    }
    
    const openRatio = openCount / totalCells;
    return openRatio >= CAVERN_CONFIG.MIN_OPEN_SPACE;
  }

  /**
   * Generate complete cavern with validation
   * Retries until valid cavern is created
   * @param {number} maxAttempts - Maximum generation attempts
   * @param {number} seed - Optional seed for deterministic generation
   * @returns {number[][]} Generated grid (0=open, 1=wall)
   */
  generate(maxAttempts = 10, seed = null) {
    if (seed !== null) {
      this.setSeed(seed);
    }
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      this.generateInitialGrid();
      this.smoothGrid();
      
      if (this.isConnected() && this.validateOpenSpace()) {
        return this.grid;
      }
    }
    
    // Failed to generate valid cavern, return last attempt
    console.warn(`CavernGenerator: Failed to generate valid cavern after ${maxAttempts} attempts`);
    return this.grid;
  }

  /**
   * Get all open positions suitable for entity placement
   * @returns {Array<{x: number, y: number}>} Array of open positions
   */
  getOpenPositions() {
    const positions = [];
    
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (this.grid[y][x] === 0) {
          positions.push({ x, y });
        }
      }
    }
    
    return positions;
  }

  /**
   * Get current grid
   * @returns {number[][]} Current grid state
   */
  getGrid() {
    return this.grid;
  }
}
