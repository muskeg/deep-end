/**
 * Enemy - Base class for all hostile sea creatures
 * Provides common detection, targeting, and attack mechanics
 */

import Phaser from 'phaser';
import { ENEMY_CONFIG } from '../utils/Constants.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  /**
   * Create an enemy
   * @param {Phaser.Scene} scene - The scene this enemy belongs to
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position
   * @param {Phaser.Physics.Arcade.Sprite} player - Reference to the player
   * @param {number} detectionRadius - How far the enemy can detect the player (default 200)
   */
  constructor(scene, x, y, player, detectionRadius = 200) {
    super(scene, x, y, 'enemy');
    
    this.scene = scene;
    this.player = player;
    this.detectionRadius = detectionRadius;
    
    // Target acquisition state
    this.hasTarget = false;
    
    // Attack cooldown
    this.attackCooldown = ENEMY_CONFIG.ATTACK_COOLDOWN;
    this.lastAttackTime = 0;
    
    // Active state
    this.isActive = true;
    
    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set up physics body
    this.body.setCircle(16);
    
    // Visual representation (placeholder)
    this.graphics = scene.add.graphics();
    this.graphics.setPipeline('Light2D'); // Enable lighting
    this.updateVisuals();
  }
  
  /**
   * Check if this enemy can detect the player
   * @returns {boolean} True if player is within detection radius
   */
  canDetectPlayer() {
    const distance = this.getDistanceToPlayer();
    return distance <= this.detectionRadius;
  }
  
  /**
   * Get the distance to the player
   * @returns {number} Distance in pixels
   */
  getDistanceToPlayer() {
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Acquire the player as a target
   * Emits 'enemy-target-acquired' event
   */
  acquireTarget() {
    if (!this.hasTarget) {
      this.hasTarget = true;
      this.scene.events.emit('enemy-target-acquired', this);
    }
  }
  
  /**
   * Lose the current target
   * Emits 'enemy-target-lost' event
   */
  loseTarget() {
    if (this.hasTarget) {
      this.hasTarget = false;
      this.scene.events.emit('enemy-target-lost', this);
    }
  }
  
  /**
   * Check if this enemy can attack (cooldown expired)
   * @returns {boolean} True if attack is off cooldown
   */
  canAttack() {
    const currentTime = this.scene.time.now;
    return currentTime - this.lastAttackTime >= this.attackCooldown;
  }
  
  /**
   * Execute an attack
   * Emits 'enemy-attack' event and starts cooldown
   */
  attack() {
    if (this.canAttack()) {
      this.lastAttackTime = this.scene.time.now;
      this.scene.events.emit('enemy-attack', this);
    }
  }
  
  /**
   * Get a normalized direction vector toward the player
   * @returns {{x: number, y: number}} Normalized direction vector
   */
  getDirectionToPlayer() {
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
      return { x: 0, y: 0 };
    }
    
    return {
      x: dx / distance,
      y: dy / distance
    };
  }
  
  /**
   * Set the active state of this enemy
   * @param {boolean} active - Whether the enemy should be active
   */
  setActive(active) {
    this.isActive = active;
    this.visible = active;
    if (!active) {
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
    }
  }
  
  /**
   * Update visual representation
   */
  updateVisuals() {
    this.graphics.clear();
    
    // Draw enemy as a circle
    const color = this.hasTarget ? 0xff0000 : 0xff6600;
    this.graphics.fillStyle(color, 0.7);
    this.graphics.fillCircle(this.x, this.y, 16);
    
    // Draw detection radius (when targeting)
    if (this.hasTarget) {
      this.graphics.lineStyle(1, 0xff0000, 0.3);
      this.graphics.strokeCircle(this.x, this.y, this.detectionRadius);
    }
  }
  
  /**
   * Main update loop - override in subclasses
   * @param {number} time - Current game time
   * @param {number} delta - Delta time since last frame
   */
  update(time, delta) {
    if (!this.isActive) return;
    
    // Check player detection
    if (this.canDetectPlayer()) {
      this.acquireTarget();
    } else {
      this.loseTarget();
    }
    
    // Update visuals
    this.updateVisuals();
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    if (this.graphics) {
      this.graphics.destroy();
    }
    super.destroy();
  }
}
