/**
 * Enemy - Base class for all hostile sea creatures
 * Provides common detection, targeting, and attack mechanics
 */

import Phaser from 'phaser';
import { ENEMY_CONFIG, COMBAT_CONFIG } from '../utils/Constants.js';

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
    
    // Health system
    this.maxHealth = COMBAT_CONFIG.ENEMY_HEALTH.BASIC || 20;
    this.health = this.maxHealth;
    
    // Target acquisition state
    this.hasTarget = false;
    
    // Chase state
    this.chaseTimer = 0;
    this.chaseDistance = 0;
    this.chaseAbandonDistance = COMBAT_CONFIG.CHASE.ABANDON_DISTANCE || 800;
    this.chaseAbandonTime = COMBAT_CONFIG.CHASE.ABANDON_TIME || 10000; // 10 seconds
    
    // Pathfinding
    this.currentPath = [];
    this.pathIndex = 0;
    this.lastPathfindTime = 0;
    this.pathfindingInterval = COMBAT_CONFIG.CHASE.PATHFINDING_UPDATE_INTERVAL || 500; // 0.5 seconds
    
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
    
    // Draw health bar
    if (this.health < this.maxHealth) {
      const barWidth = 32;
      const barHeight = 4;
      const healthPercent = this.health / this.maxHealth;
      
      // Background
      this.graphics.fillStyle(0x000000, 0.7);
      this.graphics.fillRect(this.x - barWidth / 2, this.y - 25, barWidth, barHeight);
      
      // Health fill
      this.graphics.fillStyle(healthPercent > 0.5 ? 0x00FF00 : (healthPercent > 0.25 ? 0xFFAA00 : 0xFF0000), 1);
      this.graphics.fillRect(this.x - barWidth / 2, this.y - 25, barWidth * healthPercent, barHeight);
    }
  }
  
  /**
   * Take damage from an attack
   * @param {number} amount - Damage amount
   * @returns {boolean} True if enemy was killed
   */
  takeDamage(amount) {
    this.health -= amount;
    
    // Visual feedback
    this.flashHit();
    
    // Check if killed
    if (this.health <= 0) {
      this.health = 0;
      return true;
    }
    
    return false;
  }
  
  /**
   * Flash effect when hit
   */
  flashHit() {
    // White flash
    const flash = this.scene.add.circle(this.x, this.y, 20, 0xFFFFFF, 0.8);
    flash.setPipeline('Light2D');
    
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.5,
      duration: 150,
      ease: 'Cubic.easeOut',
      onComplete: () => flash.destroy()
    });
  }
  
  /**
   * Check if should abandon chase
   * @returns {boolean} True if should stop chasing
   */
  shouldAbandonChase() {
    if (!this.hasTarget) return false;
    
    const distance = this.getDistanceToPlayer();
    
    // Distance check
    if (distance > this.chaseAbandonDistance) {
      return true;
    }
    
    // Time check
    if (this.chaseTimer > this.chaseAbandonTime) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Main update loop - override in subclasses
   * @param {number} time - Current game time
   * @param {number} delta - Delta time since last frame
   */
  update(time, delta) {
    if (!this.isActive) return;
    
    // Update chase timer
    if (this.hasTarget) {
      this.chaseTimer += delta;
      
      // Check if should abandon chase
      if (this.shouldAbandonChase()) {
        console.log(`${this.constructor.name} abandoning chase`);
        this.loseTarget();
        this.chaseTimer = 0;
      }
    }
    
    // Check player detection
    if (this.canDetectPlayer()) {
      this.acquireTarget();
    } else if (!this.hasTarget) {
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
