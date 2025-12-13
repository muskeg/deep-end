import Phaser from 'phaser';
import { CURRENT_CONFIG, COLORS } from '../utils/Constants.js';

/**
 * WaterCurrent Entity
 * Represents a water current zone that applies force to entities
 */
export default class WaterCurrent extends Phaser.GameObjects.GameObject {
  constructor(scene, x, y, width, height, direction, strength = CURRENT_CONFIG.DEFAULT_STRENGTH) {
    super(scene, 'WaterCurrent');
    
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.strength = strength;
    this.isActive = true;
    
    // Normalize direction vector
    const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    this.direction = {
      x: direction.x / length,
      y: direction.y / length
    };
    
    // Visual representation
    this.graphics = scene.add.graphics();
    this.graphics.setPipeline('Light2D'); // Enable lighting
    this.updateVisuals();
    
    scene.add.existing(this);
  }
  
  /**
   * Check if entity is within current's range
   */
  isEntityInRange(entity) {
    if (!this.isActive) return false;
    
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    
    return entity.x >= this.x - halfWidth &&
           entity.x <= this.x + halfWidth &&
           entity.y >= this.y - halfHeight &&
           entity.y <= this.y + halfHeight;
  }
  
  /**
   * Get force vector applied by this current
   */
  getForce() {
    if (!this.isActive) {
      return { x: 0, y: 0 };
    }
    
    return {
      x: this.direction.x * this.strength,
      y: this.direction.y * this.strength
    };
  }
  
  /**
   * Set current active state
   */
  setActive(active) {
    this.isActive = active;
    this.updateVisuals();
  }
  
  /**
   * Set current strength
   */
  setStrength(strength) {
    this.strength = strength;
    this.updateVisuals();
  }
  
  /**
   * Set current direction
   */
  setDirection(direction) {
    const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    this.direction = {
      x: direction.x / length,
      y: direction.y / length
    };
    this.updateVisuals();
  }
  
  /**
   * Update visual representation
   */
  updateVisuals() {
    this.graphics.clear();
    
    if (!this.isActive) {
      return;
    }
    
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    
    // Draw current zone with transparency
    this.graphics.fillStyle(COLORS.CURRENT, CURRENT_CONFIG.VISUAL_ALPHA);
    this.graphics.fillRect(
      this.x - halfWidth,
      this.y - halfHeight,
      this.width,
      this.height
    );
    
    // Draw arrow indicating direction
    const arrowLength = Math.min(this.width, this.height) * 0.4;
    const arrowX = this.direction.x * arrowLength;
    const arrowY = this.direction.y * arrowLength;
    
    this.graphics.lineStyle(3, 0xffffff, 0.8);
    this.graphics.beginPath();
    this.graphics.moveTo(this.x - arrowX / 2, this.y - arrowY / 2);
    this.graphics.lineTo(this.x + arrowX / 2, this.y + arrowY / 2);
    this.graphics.strokePath();
    
    // Arrowhead
    const headSize = 10;
    const angle = Math.atan2(this.direction.y, this.direction.x);
    const tipX = this.x + arrowX / 2;
    const tipY = this.y + arrowY / 2;
    
    this.graphics.fillStyle(0xffffff, 0.8);
    this.graphics.fillTriangle(
      tipX, tipY,
      tipX - headSize * Math.cos(angle - Math.PI / 6),
      tipY - headSize * Math.sin(angle - Math.PI / 6),
      tipX - headSize * Math.cos(angle + Math.PI / 6),
      tipY - headSize * Math.sin(angle + Math.PI / 6)
    );
  }
  
  /**
   * Update loop (for animations)
   */
  update(time, delta) {
    // Future: Add particle effects, wave animations
  }
  
  /**
   * Cleanup
   */
  destroy() {
    if (this.graphics) {
      this.graphics.destroy();
    }
    super.destroy();
  }
}
