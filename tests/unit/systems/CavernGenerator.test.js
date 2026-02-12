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

    test('should create borders (except top - water surface)', () => {
      generator.generateInitialGrid();
      const grid = generator.getGrid();
      
      const surfaceZoneHeight = Math.floor(gridHeight * 0.03);
      
      // Check water surface zone (top 3%) is always open
      for (let y = 0; y < surfaceZoneHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          expect(grid[y][x]).toBe(0); // Open water at surface
        }
      }
      
      // Check bottom border is wall
      for (let x = 0; x < gridWidth; x++) {
        expect(grid[gridHeight - 1][x]).toBe(1);
      }
      
      // Check left and right borders are walls (below surface zone)
      for (let y = surfaceZoneHeight; y < gridHeight; y++) {
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
      
      const surfaceZoneHeight = Math.floor(gridHeight * 0.03);
      
      // Test a corner below the surface zone
      const testY = Math.max(surfaceZoneHeight + 1, 5);
      const cornerCount = generator.countWallNeighbors(1, testY);
      expect(cornerCount).toBeGreaterThanOrEqual(3); // At least 3 walls near left border
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

  describe('Landmark-Aware Generation', () => {
    test('isInLandmark should detect tile inside a landmark region', () => {
      const landmarks = [
        { name: 'Test Zone', region: { minX: 10, maxX: 30, minY: 5, maxY: 20 }, wallDensity: 0.1 }
      ];
      const result = CavernGenerator.isInLandmark(15, 10, landmarks);
      expect(result).not.toBeNull();
      expect(result.name).toBe('Test Zone');
    });

    test('isInLandmark should return null for tile outside all landmarks', () => {
      const landmarks = [
        { name: 'Test Zone', region: { minX: 10, maxX: 30, minY: 5, maxY: 20 }, wallDensity: 0.1 }
      ];
      const result = CavernGenerator.isInLandmark(0, 0, landmarks);
      expect(result).toBeNull();
    });

    test('isInLandmark should return null for null landmarks', () => {
      expect(CavernGenerator.isInLandmark(10, 10, null)).toBeNull();
    });

    test('getDensityAt should return landmark density when inside a landmark', () => {
      const gen = new CavernGenerator(50, 50, 0.40);
      gen.landmarks = [
        { name: 'Open Zone', region: { minX: 5, maxX: 20, minY: 0, maxY: 25 }, wallDensity: 0.10 }
      ];
      gen.chunkOffsetY = 0;
      expect(gen.getDensityAt(10, 10)).toBe(0.10);
    });

    test('getDensityAt should return default density outside landmarks', () => {
      const gen = new CavernGenerator(50, 50, 0.40);
      gen.landmarks = [
        { name: 'Open Zone', region: { minX: 5, maxX: 20, minY: 0, maxY: 25 }, wallDensity: 0.10 }
      ];
      gen.chunkOffsetY = 0;
      expect(gen.getDensityAt(40, 40)).toBe(0.40);
    });

    test('generateWithLandmarks should produce a valid grid', () => {
      const gen = new CavernGenerator(50, 50, 0.30);
      const result = gen.generateWithLandmarks(50, 42, { chunkIndex: 0 });
      expect(result.grid).toBeDefined();
      expect(result.grid.length).toBe(50);
      expect(result.openPositions).toBeDefined();
      expect(result.landmarkPositions).toBeDefined();
    });

    test('generateWithLandmarks should use landmark densities in initial grid', () => {
      // Create a generator shaped to overlap with a low-density landmark
      const gen = new CavernGenerator(50, 50, 0.50);
      gen.landmarks = [
        { name: 'Open Area', region: { minX: 10, maxX: 40, minY: 10, maxY: 40 }, wallDensity: 0.05 }
      ];
      gen.chunkOffsetY = 0;
      gen.setSeed(123);
      gen.generateInitialGrid(0.50);
      
      // Count walls inside vs outside the landmark
      const grid = gen.getGrid();
      let insideWalls = 0, insideTotal = 0;
      let outsideWalls = 0, outsideTotal = 0;
      
      for (let y = 2; y < 48; y++) {
        for (let x = 1; x < 49; x++) {
          const lm = CavernGenerator.isInLandmark(x, y, gen.landmarks);
          if (lm) {
            insideTotal++;
            if (grid[y][x] === 1) insideWalls++;
          } else {
            outsideTotal++;
            if (grid[y][x] === 1) outsideWalls++;
          }
        }
      }
      
      const insideRatio = insideWalls / insideTotal;
      const outsideRatio = outsideWalls / outsideTotal;
      
      // Landmark region (5% density) should have significantly fewer walls
      expect(insideRatio).toBeLessThan(outsideRatio);
    });

    test('getLandmarks should return landmark array from data file', () => {
      const landmarks = CavernGenerator.getLandmarks();
      expect(Array.isArray(landmarks)).toBe(true);
      expect(landmarks.length).toBeGreaterThan(0);
      expect(landmarks[0]).toHaveProperty('name');
      expect(landmarks[0]).toHaveProperty('region');
      expect(landmarks[0]).toHaveProperty('wallDensity');
    });

    test('getOpenPositionsInLandmarks should return positions within landmark regions', () => {
      const gen = new CavernGenerator(50, 50, 0.30);
      gen.landmarks = [
        { name: 'Test', region: { minX: 10, maxX: 40, minY: 10, maxY: 40 }, wallDensity: 0.10 }
      ];
      gen.chunkOffsetY = 0;
      gen.setSeed(42);
      gen.generateInitialGrid(0.30);
      gen.smoothGrid();
      
      const landmarkPositions = gen.getOpenPositionsInLandmarks();
      expect(Array.isArray(landmarkPositions)).toBe(true);
      
      // All returned positions should be inside the landmark
      landmarkPositions.forEach(pos => {
        expect(pos.x).toBeGreaterThanOrEqual(10);
        expect(pos.x).toBeLessThanOrEqual(40);
        expect(pos.y + gen.chunkOffsetY).toBeGreaterThanOrEqual(10);
        expect(pos.y + gen.chunkOffsetY).toBeLessThanOrEqual(40);
        expect(pos.landmark).toBe('Test');
      });
    });

    test('smoothGrid should use adjusted thresholds in landmark regions', () => {
      // Low-density landmark should stay open after smoothing
      const gen = new CavernGenerator(50, 50, 0.50);
      gen.landmarks = [
        { name: 'Open Zone', region: { minX: 10, maxX: 40, minY: 10, maxY: 40 }, wallDensity: 0.10 }
      ];
      gen.chunkOffsetY = 0;
      gen.setSeed(99);
      gen.generateInitialGrid(0.50);
      gen.smoothGrid();
      
      const grid = gen.getGrid();
      let insideWalls = 0, insideTotal = 0;
      
      for (let y = 15; y < 35; y++) {
        for (let x = 15; x < 35; x++) {
          insideTotal++;
          if (grid[y][x] === 1) insideWalls++;
        }
      }
      
      const insideRatio = insideWalls / insideTotal;
      // After smoothing with raised birth threshold, landmark interior should be mostly open
      expect(insideRatio).toBeLessThan(0.40);
    });

    test('map consistency: same seed produces identical landmark patterns', () => {
      const gen1 = new CavernGenerator(50, 50, 0.30);
      const gen2 = new CavernGenerator(50, 50, 0.30);
      
      const result1 = gen1.generateWithLandmarks(50, 777, { chunkIndex: 0 });
      const result2 = gen2.generateWithLandmarks(50, 777, { chunkIndex: 0 });
      
      expect(JSON.stringify(result1.grid)).toBe(JSON.stringify(result2.grid));
    });
  });
});
