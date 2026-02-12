import Phaser from 'phaser';
import { COLORS } from '../utils/Constants.js';
import Pearl from './Pearl.js';

/**
 * Clam Entity
 * Interactive object that opens to dispense pearls.
 * Spawns with gravity enabled and settles on floors/walls like barnacles.
 */
export default class Clam extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, hasPearl = true, pearlValue = 1) {
    super(scene, x, y, 'clam-closed');
    
    this.scene = scene;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // State
    this.hasPearl = hasPearl;
    this.pearlValue = pearlValue; // Zone-based pearl value
    this.isOpen = false;
    this.pearlDispensed = false;
    
    // Sprite setup
    this.setOrigin(0.5, 0.5);
    this.setPipeline('Light2D');
    this.setDisplaySize(40, 40);
    
    // Opening animation state
    this.openingFrame = 0;
    this.openingTimer = 0;
    this.isOpening = false;
    
    // Physics — gravity settling (barnacle behavior)
    this.isSettled = false;
    this.settleTimeout = null;
    this.body.setCircle(20);
    
    // Enable gravity so the clam falls until it hits a surface
    this.body.setGravityY(200);
    this.body.setBounce(0);
    this.body.setDrag(0);
    
    // Start settle timeout — force-freeze after 2 seconds if no collision
    this.settleTimeout = scene.time.addEvent({
      delay: 2000,
      callback: () => this.settle(),
      callOnce: true
    });
    
    // Timer for auto-close
    this.closeTimer = null;
    this.autoCloseDelay = 3000; // 3 seconds
  }
  
  /**
   * Settle the clam — freeze in place (called on wall collision or timeout)
   */
  settle() {
    if (this.isSettled) return;
    
    this.isSettled = true;
    this.body.setGravityY(0);
    this.body.setVelocity(0, 0);
    this.body.setImmovable(true);
    this.body.setAllowGravity(false);
    this.setImmovable(true);
    
    // Cancel settle timeout if it hasn't fired yet
    if (this.settleTimeout) {
      this.settleTimeout.remove();
      this.settleTimeout = null;
    }
  }
  
  /**
   * Open the clam
   */
  open() {
    if (this.isOpen) return false;
    
    this.isOpening = true;
    this.openingFrame = 0;
    this.openingTimer = 0;
    this.setTexture('clam-opening-0');
    this.scene.events.emit('clam-opened', this);
    
    return true;
  }
  
  /**
   * Close the clam
   */
  close() {
    this.isOpen = false;
    this.isOpening = false;
    this.setTexture('clam-closed');
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
    if (this.isOpen) {
      if (this.hasPearl && !this.pearlDispensed) {
        this.setTexture('clam-open-pearl');
      } else {
        this.setTexture('clam-open');
      }
    } else {
      this.setTexture('clam-closed');
    }
  }
  
  /**
   * Update loop
   */
  update(time, delta) {
    // Handle opening animation
    if (this.isOpening && !this.isOpen) {
      this.openingTimer += delta;
      if (this.openingTimer >= 100) { // 100ms per frame
        this.openingTimer = 0;
        this.openingFrame++;
        
        if (this.openingFrame >= 3) {
          // Opening animation complete
          this.isOpening = false;
          this.isOpen = true;
          this.updateVisuals();
          
          // Auto-close if no pearl
          if (!this.hasPearl) {
            this.closeTimer = this.scene.time.addEvent({
              delay: this.autoCloseDelay,
              callback: () => this.close()
            });
          }
        } else {
          this.setTexture(`clam-opening-${this.openingFrame}`);
        }
      }
    }
  }
  
  /**
   * Cleanup
   */
  destroy() {
    if (this.closeTimer) {
      this.closeTimer.remove();
    }
    if (this.settleTimeout) {
      this.settleTimeout.remove();
      this.settleTimeout = null;
    }
    super.destroy();
  }
}
