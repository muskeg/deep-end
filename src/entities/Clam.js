import Phaser from 'phaser';
import { COLORS } from '../utils/Constants.js';
import Pearl from './Pearl.js';

/**
 * Clam Entity
 * Interactive object that opens to dispense pearls
 */
export default class Clam extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, hasPearl = true, pearlValue = 1) {
    super(scene, x, y);
    
    this.scene = scene;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // State
    this.hasPearl = hasPearl;
    this.pearlValue = pearlValue; // Zone-based pearl value
    this.isOpen = false;
    this.pearlDispensed = false;
    
    // Graphics
    this.graphics = scene.add.graphics();
    this.graphics.setPipeline('Light2D'); // Enable lighting
    this.updateVisuals();
    
    // Physics
    this.setImmovable(true);
    this.body.setCircle(20);
    
    // Timer for auto-close
    this.closeTimer = null;
    this.autoCloseDelay = 3000; // 3 seconds
  }
  
  /**
   * Open the clam
   */
  open() {
    if (this.isOpen) return false;
    
    this.isOpen = true;
    this.updateVisuals();
    this.scene.events.emit('clam-opened', this);
    
    // Auto-close if no pearl
    if (!this.hasPearl) {
      this.closeTimer = this.scene.time.addEvent({
        delay: this.autoCloseDelay,
        callback: () => this.close()
      });
    }
    
    return true;
  }
  
  /**
   * Close the clam
   */
  close() {
    this.isOpen = false;
    this.updateVisuals();
  }
  
  /**
   * Dispense pearl if available
   */
  dispensePearl() {
    if (!this.hasPearl || this.pearlDispensed) return null;
    
    this.pearlDispensed = true;
    this.hasPearl = false;
    
    const pearl = new Pearl(this.scene, this.x, this.y, this.pearlValue);
    this.scene.events.emit('pearl-dispensed', pearl);
    
    return pearl;
  }
  
  /**
   * Check if clam can be interacted with
   */
  canInteract() {
    return !this.isOpen && !this.pearlDispensed;
  }
  
  /**
   * Update visual representation
   */
  updateVisuals() {
    this.graphics.clear();
    
    // Draw clam shell
    if (this.isOpen) {
      // Open clam (two halves separated)
      this.graphics.fillStyle(COLORS.CLAM_OPEN, 1);
      this.graphics.fillCircle(this.x - 10, this.y, 15);
      this.graphics.fillCircle(this.x + 10, this.y, 15);
      
      // Show pearl hint if has pearl
      if (this.hasPearl && !this.pearlDispensed) {
        this.graphics.fillStyle(COLORS.PEARL, 0.8);
        this.graphics.fillCircle(this.x, this.y, 8);
      }
    } else {
      // Closed clam (single circle)
      this.graphics.fillStyle(COLORS.CLAM_CLOSED, 1);
      this.graphics.fillCircle(this.x, this.y, 20);
      
      // Subtle outline
      this.graphics.lineStyle(2, COLORS.CLAM_OPEN, 0.5);
      this.graphics.strokeCircle(this.x, this.y, 20);
    }
  }
  
  /**
   * Update loop
   */
  update(time, delta) {
    // Animation could be added here
    if (this.isOpen) {
      // Subtle shimmer effect when open
      this.updateVisuals();
    }
  }
  
  /**
   * Cleanup
   */
  destroy() {
    if (this.closeTimer) {
      this.closeTimer.remove();
    }
    if (this.graphics) {
      this.graphics.destroy();
    }
    super.destroy();
  }
}
