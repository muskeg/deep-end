/**
 * SpawnValidator
 * Validates spawn positions for enemies and other entities
 * Ensures entities don't spawn in walls, narrow passages, or too close to player
 */
export default class SpawnValidator {
  constructor() {
    this.TILE_SIZE = 50; // Grid cell size in pixels
    this.MIN_WALL_CLEARANCE = 50; // 1-tile radius (50px)
    this.MIN_PLAYER_DISTANCE = 400; // Minimum distance from player
    this.MIN_PASSAGE_WIDTH = 150; // 3-tile width for passages
  }

  /**
   * Check if position is valid for spawning
   * @param {number} x - X position in pixels
   * @param {number} y - Y position in pixels
   * @param {Array<Array<number>>} wallGrid - 2D grid (1 = wall, 0 = open)
   * @param {Object} playerPos - Player position {x, y}
   * @returns {boolean} True if position is valid
   */
  isValidSpawnPosition(x, y, wallGrid, playerPos) {
    // Convert pixel position to grid coordinates
    const gridX = Math.floor(x / this.TILE_SIZE);
    const gridY = Math.floor(y / this.TILE_SIZE);
    
    // Check if in bounds
    if (gridY < 0 || gridY >= wallGrid.length) return false;
    if (gridX < 0 || gridX >= wallGrid[0].length) return false;
    
    // Check if position itself is a wall
    if (wallGrid[gridY][gridX] === 1) return false;
    
    // Check wall clearance (1-tile radius)
    if (!this.hasWallClearance(gridX, gridY, wallGrid, 1)) return false;
    
    // Check player distance
    const distToPlayer = Math.hypot(x - playerPos.x, y - playerPos.y);
    if (distToPlayer < this.MIN_PLAYER_DISTANCE) return false;
    
    // Check if in narrow passage (3-tile minimum)
    if (this.isInNarrowPassage(gridX, gridY, wallGrid, 3)) return false;
    
    return true;
  }

  /**
   * Check if position has required wall clearance
   * @param {number} gridX - Grid X coordinate
   * @param {number} gridY - Grid Y coordinate
   * @param {Array<Array<number>>} wallGrid - 2D grid
   * @param {number} radiusTiles - Clearance radius in tiles
   * @returns {boolean} True if has clearance
   */
  hasWallClearance(gridX, gridY, wallGrid, radiusTiles) {
    for (let dy = -radiusTiles; dy <= radiusTiles; dy++) {
      for (let dx = -radiusTiles; dx <= radiusTiles; dx++) {
        const checkY = gridY + dy;
        const checkX = gridX + dx;
        
        // Out of bounds = no clearance
        if (checkY < 0 || checkY >= wallGrid.length) return false;
        if (checkX < 0 || checkX >= wallGrid[0].length) return false;
        
        // Wall nearby = no clearance
        if (wallGrid[checkY][checkX] === 1) return false;
      }
    }
    return true;
  }

  /**
   * Check if position is in a narrow passage
   * @param {number} gridX - Grid X coordinate
   * @param {number} gridY - Grid Y coordinate
   * @param {Array<Array<number>>} wallGrid - 2D grid
   * @param {number} minWidthTiles - Minimum passage width in tiles
   * @returns {boolean} True if in narrow passage
   */
  isInNarrowPassage(gridX, gridY, wallGrid, minWidthTiles) {
    // Check horizontal width
    let leftWall = gridX;
    let rightWall = gridX;
    
    // Find nearest walls on left and right
    for (let x = gridX - 1; x >= 0; x--) {
      if (wallGrid[gridY][x] === 1) {
        leftWall = x;
        break;
      }
      if (x === 0) leftWall = 0;
    }
    
    for (let x = gridX + 1; x < wallGrid[0].length; x++) {
      if (wallGrid[gridY][x] === 1) {
        rightWall = x;
        break;
      }
      if (x === wallGrid[0].length - 1) rightWall = wallGrid[0].length - 1;
    }
    
    const horizontalWidth = rightWall - leftWall;
    if (horizontalWidth < minWidthTiles) return true;
    
    // Check vertical height
    let topWall = gridY;
    let bottomWall = gridY;
    
    for (let y = gridY - 1; y >= 0; y--) {
      if (wallGrid[y][gridX] === 1) {
        topWall = y;
        break;
      }
      if (y === 0) topWall = 0;
    }
    
    for (let y = gridY + 1; y < wallGrid.length; y++) {
      if (wallGrid[y][gridX] === 1) {
        bottomWall = y;
        break;
      }
      if (y === wallGrid.length - 1) bottomWall = wallGrid.length - 1;
    }
    
    const verticalHeight = bottomWall - topWall;
    if (verticalHeight < minWidthTiles) return true;
    
    return false;
  }

  /**
   * Get random valid position from list of open positions
   * @param {Array<{x: number, y: number}>} openPositions - List of open grid positions
   * @param {Array<Array<number>>} wallGrid - 2D grid
   * @param {Object} playerPos - Player position {x, y}
   * @returns {{x: number, y: number} | null} Valid position in pixels or null
   */
  getRandomValidPosition(openPositions, wallGrid, playerPos) {
    if (!openPositions || openPositions.length === 0) return null;
    
    // Shuffle positions to get random order
    const shuffled = [...openPositions].sort(() => Math.random() - 0.5);
    
    // Try each position until we find a valid one
    for (const pos of shuffled) {
      const pixelX = pos.x * this.TILE_SIZE + this.TILE_SIZE / 2;
      const pixelY = pos.y * this.TILE_SIZE + this.TILE_SIZE / 2;
      
      if (this.isValidSpawnPosition(pixelX, pixelY, wallGrid, playerPos)) {
        return { x: pixelX, y: pixelY };
      }
    }
    
    return null; // No valid position found
  }
}
