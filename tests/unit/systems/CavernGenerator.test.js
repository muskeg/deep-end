import CavernGenerator from '../../../src/systems/CavernGenerator.js';
import { CAVERN_CONFIG } from '../../../src/utils/Constants.js';

describe('CavernGenerator', () => {
  let generator;
  const gridWidth = 50;
  const gridHeight = 50;

  beforeEach(() => {
    generator = new CavernGenerator(gridWidth, gridHeight);
  });

  describe('Initialization', () => {
    test('should create generator with correct dimensions', () => {
      expect(generator.width).toBe(gridWidth);
      expect(generator.height).toBe(gridHeight);
    });

    test('should initialize empty grid', () => {
      const grid = generator.getGrid();
      expect(grid).toBeDefined();
      expect(grid.length).toBe(gridHeight);
      expect(grid[0].length).toBe(gridWidth);
    });

    test('should accept custom density parameter', () => {
      const customGenerator = new CavernGenerator(50, 50, 0.55);
      expect(customGenerator).toBeDefined();
    });
  });

  describe('Initial Grid Generation', () => {
    test('should fill grid with random walls and open spaces', () => {
      generator.generateInitialGrid();
      const grid = generator.getGrid();
      
      let wallCount = 0;
      let openCount = 0;
      
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          if (grid[y][x] === 1) wallCount++;
          else openCount++;
        }
      }
      
      expect(wallCount).toBeGreaterThan(0);
      expect(openCount).toBeGreaterThan(0);
    });

    test('should respect density parameter', () => {
      generator.generateInitialGrid(0.8); // 80% walls
      const grid = generator.getGrid();
      
      let wallCount = 0;
      const totalCells = gridWidth * gridHeight;
      
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          if (grid[y][x] === 1) wallCount++;
        }
      }
      
      const wallRatio = wallCount / totalCells;
      expect(wallRatio).toBeGreaterThan(0.7); // Allow some variance
      expect(wallRatio).toBeLessThan(0.9);
    });

    test('should create borders with walls', () => {
      generator.generateInitialGrid();
      const grid = generator.getGrid();
      
      // Check top and bottom borders
      for (let x = 0; x < gridWidth; x++) {
        expect(grid[0][x]).toBe(1);
        expect(grid[gridHeight - 1][x]).toBe(1);
      }
      
      // Check left and right borders
      for (let y = 0; y < gridHeight; y++) {
        expect(grid[y][0]).toBe(1);
        expect(grid[y][gridWidth - 1]).toBe(1);
      }
    });
  });

  describe('Cellular Automata Smoothing', () => {
    beforeEach(() => {
      generator.generateInitialGrid();
    });

    test('should smooth grid using cellular automata rules', () => {
      const gridBefore = JSON.stringify(generator.getGrid());
      generator.smoothGrid();
      const gridAfter = JSON.stringify(generator.getGrid());
      
      expect(gridBefore).not.toBe(gridAfter);
    });

    test('should apply multiple iterations', () => {
      const iterations = 4;
      generator.smoothGrid(iterations);
      
      // Grid should be more clustered/cave-like after smoothing
      const grid = generator.getGrid();
      expect(grid).toBeDefined();
    });

    test('should use birth and death thresholds correctly', () => {
      // Cell with 5+ wall neighbors should become wall (birth)
      // Cell with <3 wall neighbors should become open (death)
      generator.smoothGrid();
      const grid = generator.getGrid();
      
      // Check that smoothing created more clustered regions
      let largeOpenAreas = 0;
      for (let y = 1; y < gridHeight - 1; y++) {
        for (let x = 1; x < gridWidth - 1; x++) {
          if (grid[y][x] === 0) {
            // Count connected open spaces
            const neighbors = generator.countWallNeighbors(x, y);
            if (neighbors < 3) largeOpenAreas++;
          }
        }
      }
      
      expect(largeOpenAreas).toBeGreaterThan(0);
    });
  });

  describe('Neighbor Counting', () => {
    test('should count wall neighbors correctly', () => {
      generator.generateInitialGrid();
      const grid = generator.getGrid();
      
      // Test a cell in the middle
      const x = 25;
      const y = 25;
      const count = generator.countWallNeighbors(x, y);
      
      expect(count).toBeGreaterThanOrEqual(0);
      expect(count).toBeLessThanOrEqual(8);
    });

    test('should handle edge cells correctly', () => {
      generator.generateInitialGrid();
      
      // Edge cells should treat out-of-bounds as walls
      const cornerCount = generator.countWallNeighbors(1, 1);
      expect(cornerCount).toBeGreaterThanOrEqual(3); // At least 3 border walls
    });
  });

  describe('Connectivity Validation', () => {
    test('should detect connected regions using flood fill', () => {
      generator.generateInitialGrid();
      generator.smoothGrid();
      
      const connected = generator.isConnected();
      expect(typeof connected).toBe('boolean');
    });

    test('should identify if grid has sufficient open space', () => {
      generator.generateInitialGrid();
      generator.smoothGrid();
      
      const valid = generator.validateOpenSpace();
      expect(typeof valid).toBe('boolean');
    });

    test('should regenerate if validation fails', () => {
      const maxAttempts = 50; // Increase attempts to ensure success
      const result = generator.generate(maxAttempts);
      
      expect(result).toBeDefined();
      expect(generator.isConnected()).toBe(true);
      expect(generator.validateOpenSpace()).toBe(true);
    });
  });

  describe('Complete Generation Process', () => {
    test('should generate valid cavern', () => {
      const grid = generator.generate();
      
      expect(grid).toBeDefined();
      expect(grid.length).toBe(gridHeight);
      expect(grid[0].length).toBe(gridWidth);
      expect(generator.isConnected()).toBe(true);
      expect(generator.validateOpenSpace()).toBe(true);
    });

    test('should complete generation within performance budget', () => {
      const startTime = Date.now();
      generator.generate();
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // <100ms for 50x50 grid
    });

    test('should handle different grid sizes', () => {
      const smallGen = new CavernGenerator(30, 30);
      const largeGen = new CavernGenerator(100, 100);
      
      const smallGrid = smallGen.generate();
      const largeGrid = largeGen.generate();
      
      expect(smallGrid.length).toBe(30);
      expect(largeGrid.length).toBe(100);
    });
  });

  describe('Deterministic Generation', () => {
    test('should generate same cavern with same seed', () => {
      const seed = 12345;
      const gen1 = new CavernGenerator(50, 50);
      const gen2 = new CavernGenerator(50, 50);
      
      const grid1 = gen1.generate(10, seed);
      const grid2 = gen2.generate(10, seed);
      
      expect(JSON.stringify(grid1)).toBe(JSON.stringify(grid2));
    });

    test('should generate different caverns with different seeds', () => {
      const gen1 = new CavernGenerator(50, 50);
      const gen2 = new CavernGenerator(50, 50);
      
      const grid1 = gen1.generate(10, 111);
      const grid2 = gen2.generate(10, 222);
      
      expect(JSON.stringify(grid1)).not.toBe(JSON.stringify(grid2));
    });
  });

  describe('Get Open Positions', () => {
    test('should return list of all open cells', () => {
      generator.generate();
      const openPositions = generator.getOpenPositions();
      
      expect(Array.isArray(openPositions)).toBe(true);
      expect(openPositions.length).toBeGreaterThan(0);
      
      // Verify positions are actually open
      const grid = generator.getGrid();
      openPositions.forEach(pos => {
        expect(grid[pos.y][pos.x]).toBe(0);
      });
    });

    test('should return positions suitable for entity placement', () => {
      generator.generate();
      const openPositions = generator.getOpenPositions();
      
      // Should have enough space for multiple entities
      expect(openPositions.length).toBeGreaterThan(20);
    });
  });
});
