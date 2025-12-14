/**
 * PathfindingSystem - A* pathfinding for enemy navigation
 * Handles pathfinding around walls and obstacles
 */

export default class PathfindingSystem {
  constructor(scene) {
    this.scene = scene;
    this.grid = null;
    this.gridWidth = 0;
    this.gridHeight = 0;
    this.cellSize = 50; // Grid cell size in pixels
  }
  
  /**
   * Build navigation grid from wall data
   * @param {Array<{x: number, y: number, width: number, height: number}>} walls - Wall rectangles
   * @param {number} worldWidth - World width in pixels
   * @param {number} worldHeight - World height in pixels
   */
  buildGrid(walls, worldWidth, worldHeight) {
    this.gridWidth = Math.ceil(worldWidth / this.cellSize);
    this.gridHeight = Math.ceil(worldHeight / this.cellSize);
    
    // Initialize grid (0 = walkable, 1 = blocked)
    this.grid = Array(this.gridHeight).fill(0).map(() => Array(this.gridWidth).fill(0));
    
    // Mark wall cells as blocked
    walls.forEach(wall => {
      const startX = Math.floor(wall.x / this.cellSize);
      const startY = Math.floor(wall.y / this.cellSize);
      const endX = Math.ceil((wall.x + wall.width) / this.cellSize);
      const endY = Math.ceil((wall.y + wall.height) / this.cellSize);
      
      for (let y = startY; y < endY && y < this.gridHeight; y++) {
        for (let x = startX; x < endX && x < this.gridWidth; x++) {
          if (x >= 0 && y >= 0) {
            this.grid[y][x] = 1;
          }
        }
      }
    });
    
    console.log(`PathfindingSystem: Built ${this.gridWidth}x${this.gridHeight} grid (${this.cellSize}px cells)`);
  }
  
  /**
   * Find path from start to target using A* algorithm
   * @param {number} startX - Start position X in pixels
   * @param {number} startY - Start position Y in pixels
   * @param {number} targetX - Target position X in pixels
   * @param {number} targetY - Target position Y in pixels
   * @returns {Array<{x: number, y: number}>} Array of waypoint positions in pixels, or null if no path
   */
  findPath(startX, startY, targetX, targetY) {
    if (!this.grid) {
      console.warn('PathfindingSystem: Grid not built, call buildGrid() first');
      return null;
    }
    
    // Convert pixel coordinates to grid coordinates
    const startGridX = Math.floor(startX / this.cellSize);
    const startGridY = Math.floor(startY / this.cellSize);
    const targetGridX = Math.floor(targetX / this.cellSize);
    const targetGridY = Math.floor(targetY / this.cellSize);
    
    // Validate coordinates
    if (!this.isValidCell(startGridX, startGridY) || !this.isValidCell(targetGridX, targetGridY)) {
      return null;
    }
    
    // Check if start or target is blocked
    if (this.grid[startGridY][startGridX] === 1 || this.grid[targetGridY][targetGridX] === 1) {
      return null;
    }
    
    // A* algorithm
    const openSet = [];
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    const startKey = `${startGridX},${startGridY}`;
    const targetKey = `${targetGridX},${targetGridY}`;
    
    openSet.push({ x: startGridX, y: startGridY, key: startKey });
    gScore.set(startKey, 0);
    fScore.set(startKey, this.manhattanDistance(startGridX, startGridY, targetGridX, targetGridY));
    
    while (openSet.length > 0) {
      // Get node with lowest fScore
      openSet.sort((a, b) => fScore.get(a.key) - fScore.get(b.key));
      const current = openSet.shift();
      
      // Reached target
      if (current.key === targetKey) {
        return this.reconstructPath(cameFrom, current);
      }
      
      closedSet.add(current.key);
      
      // Check neighbors (4-directional)
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];
      
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        
        // Skip if invalid, blocked, or already evaluated
        if (!this.isValidCell(neighbor.x, neighbor.y) ||
            this.grid[neighbor.y][neighbor.x] === 1 ||
            closedSet.has(neighborKey)) {
          continue;
        }
        
        const tentativeGScore = gScore.get(current.key) + 1;
        
        // Check if this path to neighbor is better
        if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + this.manhattanDistance(neighbor.x, neighbor.y, targetGridX, targetGridY));
          
          // Add to openSet if not already there
          if (!openSet.find(n => n.key === neighborKey)) {
            openSet.push({ x: neighbor.x, y: neighbor.y, key: neighborKey });
          }
        }
      }
    }
    
    // No path found
    return null;
  }
  
  /**
   * Reconstruct path from A* came-from map
   * @param {Map} cameFrom - Map of node to previous node
   * @param {object} current - Final node
   * @returns {Array<{x: number, y: number}>} Path in pixel coordinates
   */
  reconstructPath(cameFrom, current) {
    const path = [];
    let node = current;
    
    while (node) {
      // Convert grid coordinates back to pixel coordinates (center of cell)
      path.unshift({
        x: node.x * this.cellSize + this.cellSize / 2,
        y: node.y * this.cellSize + this.cellSize / 2
      });
      
      node = cameFrom.get(node.key);
    }
    
    return path;
  }
  
  /**
   * Calculate Manhattan distance heuristic
   * @param {number} x1 - First X coordinate
   * @param {number} y1 - First Y coordinate
   * @param {number} x2 - Second X coordinate
   * @param {number} y2 - Second Y coordinate
   * @returns {number} Manhattan distance
   */
  manhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }
  
  /**
   * Check if grid cell is valid
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   * @returns {boolean} True if valid
   */
  isValidCell(x, y) {
    return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
  }
}
