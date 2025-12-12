/**
 * Eel - Aggressive enemy with chase and lunge attack behaviors
 * Returns to hiding position when losing target
 */

import Enemy from './Enemy.js';
import { ENEMY_CONFIG } from '../utils/Constants.js';

export default class Eel extends Enemy {
  /**
   * Create an eel enemy
   * @param {Phaser.Scene} scene - The scene this eel belongs to
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position
   * @param {Phaser.Physics.Arcade.Sprite} player - Reference to the player
   * @param {{x: number, y: number}} hidingPosition - Position to return to (defaults to start position)
   */
  constructor(scene, x, y, player, hidingPosition = null) {
    super(scene, x, y, player, ENEMY_CONFIG.EEL.DETECTION_RADIUS);
    
    // Hiding position (resting spot)
    this.hidingPosition = hidingPosition || { x, y };
    
    // State machine
    this.state = 'idle'; // idle, chasing, lunging, returning
    
    // Movement speeds
    this.chaseSpeed = ENEMY_CONFIG.EEL.CHASE_SPEED;
    this.lungeSpeed = ENEMY_CONFIG.EEL.LUNGE_SPEED;
    
    // Lunge attack configuration
    this.lungeRange = ENEMY_CONFIG.EEL.LUNGE_RANGE;
    this.lungeCooldown = ENEMY_CONFIG.EEL.LUNGE_COOLDOWN;
    this.lungeDuration = ENEMY_CONFIG.EEL.LUNGE_DURATION;
    this.lastLungeTime = -this.lungeCooldown; // Allow immediate first lunge
    this.lungeStartTime = 0;
    this.lungeDirection = { x: 0, y: 0 };
    
    // Hiding position reach threshold
    this.hideReachThreshold = 10;
  }
  
  /**
   * Execute chase behavior - pursue the player
   * @param {number} delta - Delta time in milliseconds
   */
  chase(delta) {
    const direction = this.getDirectionToPlayer();
    
    this.body.velocity.x = direction.x * this.chaseSpeed;
    this.body.velocity.y = direction.y * this.chaseSpeed;
  }
  
  /**
   * Execute lunge attack - dash toward player at high speed
   * @param {number} delta - Delta time in milliseconds
   */
  lunge(delta) {
    // Maintain lunge direction
    this.body.velocity.x = this.lungeDirection.x * this.lungeSpeed;
    this.body.velocity.y = this.lungeDirection.y * this.lungeSpeed;
  }
  
  /**
   * Return to hiding position
   * @param {number} delta - Delta time in milliseconds
   */
  returnToHiding(delta) {
    const dx = this.hidingPosition.x - this.x;
    const dy = this.hidingPosition.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if reached hiding position
    if (distance < this.hideReachThreshold) {
      this.state = 'idle';
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
      return;
    }
    
    // Move toward hiding position
    const directionX = dx / distance;
    const directionY = dy / distance;
    
    this.body.velocity.x = directionX * this.chaseSpeed;
    this.body.velocity.y = directionY * this.chaseSpeed;
  }
  
  /**
   * Check if eel can perform lunge attack
   * @returns {boolean} True if cooldown expired
   */
  canLunge() {
    const currentTime = this.scene.time.now;
    return currentTime - this.lastLungeTime >= this.lungeCooldown;
  }
  
  /**
   * Check if player is in lunge range
   * @returns {boolean} True if player is close enough to lunge
   */
  isPlayerInLungeRange() {
    return this.getDistanceToPlayer() <= this.lungeRange;
  }
  
  /**
   * Update visual representation
   */
  updateVisuals() {
    this.graphics.clear();
    
    // Change color based on state
    let color = 0x00aa00; // Green when idle
    if (this.state === 'chasing') color = 0xffaa00; // Orange when chasing
    if (this.state === 'lunging') color = 0xff0000; // Red when lunging
    if (this.state === 'returning') color = 0x0088ff; // Blue when returning
    
    this.graphics.fillStyle(color, 0.7);
    
    // Draw eel body (elongated rectangle)
    const bodyWidth = 40;
    const bodyHeight = 16;
    this.graphics.fillRect(this.x - bodyWidth / 2, this.y - bodyHeight / 2, bodyWidth, bodyHeight);
    
    // Draw head (circle)
    this.graphics.fillCircle(this.x + bodyWidth / 2, this.y, 12);
  }
  
  /**
   * Main update loop - state machine
   * @param {number} time - Current game time
   * @param {number} delta - Delta time since last frame
   */
  update(time, delta) {
    if (!this.isActive) return;
    
    const currentTime = this.scene.time.now;
    
    // State machine transitions
    switch (this.state) {
      case 'idle':
        // Check for player detection
        if (this.canDetectPlayer()) {
          this.state = 'chasing';
          this.acquireTarget();
        }
        break;
        
      case 'chasing':
        // Check if lost player
        if (!this.canDetectPlayer()) {
          this.state = 'returning';
          this.loseTarget();
          break;
        }
        
        // Check if can lunge
        if (this.isPlayerInLungeRange() && this.canLunge()) {
          this.state = 'lunging';
          this.lungeDirection = this.getDirectionToPlayer();
          this.lungeStartTime = currentTime;
          this.lastLungeTime = currentTime;
          this.attack();
          break;
        }
        
        this.chase(delta);
        break;
        
      case 'lunging':
        // Check if lunge duration expired
        if (currentTime - this.lungeStartTime >= this.lungeDuration) {
          this.state = 'chasing';
          break;
        }
        
        this.lunge(delta);
        break;
        
      case 'returning':
        this.returnToHiding(delta);
        break;
    }
    
    // Update visuals
    this.updateVisuals();
  }
}
