/**
 * DashCooldown - UI component showing dash ability cooldown
 */

import Phaser from 'phaser';
import { COLORS } from '../utils/Constants.js';

export default class DashCooldown extends Phaser.GameObjects.Container {
  /**
   * Create dash cooldown UI
   * @param {Phaser.Scene} scene - The scene this belongs to
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  constructor(scene, x, y) {
    super(scene, x, y);
    
    this.scene = scene;
    scene.add.existing(this);
    
    // Cooldown state
    this.maxCooldown = 3000; // 3 seconds in milliseconds
    this.currentCooldown = 0;
    this.isOnCooldown = false;
    
    // Background
    this.background = scene.add.rectangle(0, 0, 120, 40, 0x000000, 0.7);
    this.add(this.background);
    
    // Cooldown bar background
    this.barBg = scene.add.rectangle(-50, 10, 100, 12, 0x333333, 1);
    this.add(this.barBg);
    
    // Cooldown bar fill
    this.barFill = scene.add.rectangle(-50, 10, 100, 12, COLORS.DASH || 0x00FFFF, 1);
    this.barFill.setOrigin(0, 0.5);
    this.add(this.barFill);
    
    // Label
    this.label = scene.add.text(0, -10, 'DASH', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    this.label.setOrigin(0.5);
    this.add(this.label);
    
    // Ready indicator
    this.readyText = scene.add.text(0, 10, 'READY', {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#00FF00',
      fontStyle: 'bold'
    });
    this.readyText.setOrigin(0.5);
    this.add(this.readyText);
    
    this.updateDisplay();
  }
  
  /**
   * Start cooldown timer
   * @param {number} duration - Cooldown duration in milliseconds
   */
  startCooldown(duration) {
    this.maxCooldown = duration;
    this.currentCooldown = duration;
    this.isOnCooldown = true;
    this.updateDisplay();
  }
  
  /**
   * Update cooldown state
   * @param {number} deltaTime - Time elapsed since last update in milliseconds
   */
  update(deltaTime) {
    if (!this.isOnCooldown) return;
    
    this.currentCooldown -= deltaTime;
    
    if (this.currentCooldown <= 0) {
      this.currentCooldown = 0;
      this.isOnCooldown = false;
    }
    
    this.updateDisplay();
  }
  
  /**
   * Check if dash can be activated
   * @returns {boolean} True if ready
   */
  canActivate() {
    return !this.isOnCooldown;
  }
  
  /**
   * Update visual display
   */
  updateDisplay() {
    if (this.isOnCooldown) {
      // Show cooldown progress
      const progress = 1 - (this.currentCooldown / this.maxCooldown);
      this.barFill.displayWidth = 100 * progress;
      this.barFill.setTint(0x888888);
      
      // Show remaining time
      const seconds = (this.currentCooldown / 1000).toFixed(1);
      this.readyText.setText(`${seconds}s`);
      this.readyText.setColor('#FF8800');
    } else {
      // Show ready state
      this.barFill.displayWidth = 100;
      this.barFill.clearTint();
      this.readyText.setText('READY');
      this.readyText.setColor('#00FF00');
      
      // Pulse effect when ready
      if (!this.readyPulse) {
        this.readyPulse = this.scene.tweens.add({
          targets: this.readyText,
          alpha: 0.5,
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }
  }
  
  /**
   * Clean up
   */
  destroy() {
    if (this.readyPulse) {
      this.readyPulse.remove();
    }
    super.destroy();
  }
}
