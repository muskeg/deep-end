import Phaser from 'phaser';
import { GAME_CONFIG } from '../utils/Constants.js';

/**
 * Wall Entity
 * Represents a solid wall tile in the cavern
 */
export default class Wall extends Phaser.GameObjects.Image {
  constructor(scene, x, y, tileSize = GAME_CONFIG.TILE_SIZE) {
    const worldX = x * tileSize + tileSize / 2;
    const worldY = y * tileSize + tileSize / 2;
    
    // Pick a random wall variant (wall-0 through wall-3)
    const variant = Phaser.Math.Between(0, 3);
    super(scene, worldX, worldY, `wall-${variant}`);
    
    this.scene = scene;
    this.gridX = x;
    this.gridY = y;
    this.tileSize = tileSize;
    this.worldX = worldX;
    this.worldY = worldY;
    
    this.setDisplaySize(tileSize, tileSize);
    scene.add.existing(this);
    
    // Enable lighting on walls
    this.setPipeline('Light2D');
    
    // Add physics body
    this.body = scene.physics.add.staticBody(
      this.worldX,
      this.worldY,
      tileSize,
      tileSize
    );
  }
  
  /**
   * Get physics body for collisions
   */
  getBody() {
    return this.body;
  }
}
