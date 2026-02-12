/**
 * Jellyfish - Patrol-based enemy that follows waypoints
 * Switches to chase behavior when player is detected
 */

import Enemy from './Enemy.js';
import { ENEMY_CONFIG } from '../utils/Constants.js';

export default class Jellyfish extends Enemy {
  /**
   * Create a jellyfish enemy
   * @param {Phaser.Scene} scene - The scene this jellyfish belongs to
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position
   * @param {Phaser.Physics.Arcade.Sprite} player - Reference to the player
   * @param {Array<{x: number, y: number}>} waypoints - Patrol waypoints (optional)
   * @param {object} multipliers - Zone-based difficulty multipliers
   */
  constructor(scene, x, y, player, waypoints = [], multipliers = {}) {
    super(scene, x, y, 'jellyfish-0', player, ENEMY_CONFIG.JELLYFISH.DETECTION_RADIUS);
    
    // Animation properties
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.animationSpeed = 200; // ms per frame
    
    // Apply zone multipliers
    const { speedMultiplier = 1.0, damageMultiplier = 1.0 } = multipliers;
    
    // Patrol configuration
    this.waypoints = waypoints;
    this.currentWaypointIndex = 0;
    this.waypointReachThreshold = 10; // Distance to consider waypoint "reached"
    
    // Movement speeds (with zone multiplier)
    this.patrolSpeed = ENEMY_CONFIG.JELLYFISH.PATROL_SPEED * speedMultiplier;
    this.chaseSpeed = ENEMY_CONFIG.JELLYFISH.CHASE_SPEED * speedMultiplier;
    
    // Damage (with zone multiplier)
    this.contactDamage = (ENEMY_CONFIG.JELLYFISH.CONTACT_DAMAGE || 10) * damageMultiplier;
  }
  
  /**
   * Execute patrol behavior - follow waypoints in sequence
   * @param {number} delta - Delta time in milliseconds
   */
  patrol(delta) {
    if (!this.waypoints || this.waypoints.length === 0) {
      // No waypoints, stay stationary
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
      return;
    }
    
    const currentWaypoint = this.waypoints[this.currentWaypointIndex];
    const dx = currentWaypoint.x - this.x;
    const dy = currentWaypoint.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if reached waypoint
    if (distance < this.waypointReachThreshold) {
      // Move to next waypoint (loop back to start)
      this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.waypoints.length;
      // Recalculate to new waypoint
      const newWaypoint = this.waypoints[this.currentWaypointIndex];
      const ndx = newWaypoint.x - this.x;
      const ndy = newWaypoint.y - this.y;
      const ndist = Math.sqrt(ndx * ndx + ndy * ndy);
      
      if (ndist === 0) {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        return;
      }
      
      this.body.velocity.x = (ndx / ndist) * this.patrolSpeed;
      this.body.velocity.y = (ndy / ndist) * this.patrolSpeed;
      return;
    }
    
    // Move toward waypoint
    const directionX = dx / distance;
    const directionY = dy / distance;
    
    this.body.velocity.x = directionX * this.patrolSpeed;
    this.body.velocity.y = directionY * this.patrolSpeed;
  }
  
  /**
   * Execute chase behavior - pursue the player using pathfinding
   * @param {number} delta - Delta time in milliseconds
   */
  chase(delta) {
    // Try to use pathfinding waypoint first
    const waypoint = this.getNextWaypoint();
    
    let targetX, targetY;
    if (waypoint) {
      // Follow pathfinding waypoint
      targetX = waypoint.x;
      targetY = waypoint.y;
    } else {
      // Fallback to direct pursuit if no path
      targetX = this.player.x;
      targetY = this.player.y;
    }
    
    // Calculate direction to target
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
      return;
    }
    
    const directionX = dx / distance;
    const directionY = dy / distance;
    
    this.body.velocity.x = directionX * this.chaseSpeed;
    this.body.velocity.y = directionY * this.chaseSpeed;
  }
  
  /**
   * Main update loop
   * @param {number} time - Current game time
   * @param {number} delta - Delta time since last frame
   */
  update(time, delta) {
    if (!this.isActive) return;
    
    // Update animation
    this.updateAnimation(delta);
    
    // Base enemy update (handles detection)
    super.update(time, delta);
    
    // Behavior based on target state
    if (this.hasTarget) {
      this.chase(delta);
    } else {
      this.patrol(delta);
    }
  }
  
  /**
   * Update sprite animation
   * @param {number} delta - Delta time in milliseconds
   */
  updateAnimation(delta) {
    this.animationTimer += delta;
    
    if (this.animationTimer >= this.animationSpeed) {
      this.animationTimer = 0;
      this.animationFrame = (this.animationFrame + 1) % 3;
      this.setTexture(`jellyfish-${this.animationFrame}`);
    }
  }
}
