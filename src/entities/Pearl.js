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
    this.graphics.setPipeline('Light2D'); // Enable lighting
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
    
    // Create particle burst effect
    this.createCollectionParticles();
    
    // Play collection sound with pitch variation based on value
    if (this.scene.audioManager) {
      this.scene.audioManager.playPearlCollect();
    }
    
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
   * Create particle burst effect on collection
   */
  createCollectionParticles() {
    if (!this.scene || !this.scene.add) return;
    
    // Sparkle burst particles
    const particleCount = Math.min(15, 5 + this.value); // More particles for higher value
    const colors = [COLORS.PEARL, 0xFFFFFF, 0xADD8E6]; // Pearl color, white, light blue
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 100 + Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 3 + Math.random() * 4;
      
      // Create particle graphic
      const particle = this.scene.add.circle(this.x, this.y, size, color, 1);
      particle.setDepth(100);
      
      // Animate particle outward
      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * (50 + Math.random() * 50),
        y: this.y + Math.sin(angle) * (50 + Math.random() * 50),
        alpha: 0,
        scale: 0.2,
        duration: 500 + Math.random() * 300,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy()
      });
    }
    
    // Central flash effect
    const flash = this.scene.add.circle(this.x, this.y, 15, 0xFFFFFF, 0.8);
    flash.setDepth(100);
    this.scene.tweens.add({
      targets: flash,
      scale: 2.5,
      alpha: 0,
      duration: 300,
      ease: 'Cubic.easeOut',
      onComplete: () => flash.destroy()
    });
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
