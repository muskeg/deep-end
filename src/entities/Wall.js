import Phaser from 'phaser';
import { COLORS, GAME_CONFIG } from '../utils/Constants.js';

/**
 * Wall Entity
 * Represents a solid wall tile in the cavern
 */
export default class Wall extends Phaser.GameObjects.Graphics {
  constructor(scene, x, y, tileSize = GAME_CONFIG.TILE_SIZE) {
    super(scene);
    
    this.scene = scene;
    this.gridX = x;
    this.gridY = y;
    this.tileSize = tileSize;
    this.worldX = x * tileSize + tileSize / 2;
    this.worldY = y * tileSize + tileSize / 2;
    
    scene.add.existing(this);
    
    // Enable lighting on walls
    this.setPipeline('Light2D');
    
    // Draw wall tile
    this.draw();
    
    // Add physics body
    this.body = scene.physics.add.staticBody(
      this.worldX,
      this.worldY,
      tileSize,
      tileSize
    );
  }
  
  /**
   * Draw wall visual
   */
  draw() {
    this.clear();
    
    // Main wall color
    this.fillStyle(COLORS.WALL, 1);
    this.fillRect(
      this.worldX - this.tileSize / 2,
      this.worldY - this.tileSize / 2,
      this.tileSize,
      this.tileSize
    );
    
    // Subtle edge highlight
    this.lineStyle(1, COLORS.WALL + 0x222222, 0.3);
    this.strokeRect(
      this.worldX - this.tileSize / 2,
      this.worldY - this.tileSize / 2,
      this.tileSize,
      this.tileSize
    );
  }
  
  /**
   * Get physics body for collisions
   */
  getBody() {
    return this.body;
  }
}
