import Phaser from 'phaser';
import { PEARL_VALUE, COLORS } from '../utils/Constants.js';

/**
 * Pearl Entity
 * Collectible object that awards points
 */
export default class Pearl extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, value = PEARL_VALUE) {
    super(scene, x, y);
    
    this.scene = scene;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // State
    this.value = value;
    this.isCollected = false;
    
    // Graphics
    this.graphics = scene.add.graphics();
    this.updateVisuals();
    
    // Physics
    this.body.setCircle(10);
    
    // Visual effects
    this.createFloatAnimation();
    this.createShimmerEffect();
  }
  
  /**
   * Create floating animation
   */
  createFloatAnimation() {
    this.floatTween = this.scene.tweens.add({
      targets: this,
      y: this.y - 10,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }
  
  /**
   * Create shimmer effect
   */
  createShimmerEffect() {
    const shimmerData = { alpha: 1 };
    
    this.shimmerTween = this.scene.tweens.add({
      targets: shimmerData,
      alpha: 0.6,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      onUpdate: () => {
        this.updateVisuals(shimmerData.alpha);
      }
    });
  }
  
  /**
   * Collect the pearl
   */
  collect() {
    if (this.isCollected) return false;
    
    this.isCollected = true;
    this.body.enable = false;
    
    try {
      this.scene.events.emit('pearl-collected', this.value);
    } catch (error) {
      // Handle case where scene is destroyed
      console.warn('Failed to emit pearl-collected event:', error);
    }
    
    // Collection animation
    try {
      this.scene.tweens.add({
        targets: this,
        scale: 1.5,
        alpha: 0,
        duration: 500,
        ease: 'Back.easeIn',
        onComplete: () => {
          this.destroy();
        }
      });
    } catch (error) {
      // If animation fails (e.g., scene destroyed), just destroy immediately
      this.destroy();
    }
    
    return true;
  }
  
  /**
   * Check if pearl was collected
   */
  wasCollected() {
    return this.isCollected;
  }
  
  /**
   * Get pearl value
   */
  getValue() {
    return this.value;
  }
  
  /**
   * Update visual representation
   */
  updateVisuals(alpha = 1) {
    if (!this.graphics) return;
    
    this.graphics.clear();
    
    // Draw pearl with shimmer
    this.graphics.fillStyle(COLORS.PEARL, alpha);
    this.graphics.fillCircle(this.x, this.y, 10);
    
    // Highlight
    this.graphics.fillStyle(0xffffff, alpha * 0.5);
    this.graphics.fillCircle(this.x - 3, this.y - 3, 4);
  }
  
  /**
   * Update loop
   */
  update(time, delta) {
    if (!this.isCollected) {
      this.updateVisuals();
    }
  }
  
  /**
   * Cleanup
   */
  destroy() {
    if (this.floatTween) {
      this.floatTween.stop();
    }
    if (this.shimmerTween) {
      this.shimmerTween.stop();
    }
    if (this.graphics) {
      this.graphics.destroy();
    }
    if (this.body) {
      this.body.destroy();
    }
    super.destroy();
  }
}
