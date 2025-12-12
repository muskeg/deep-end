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
   */
  constructor(scene, x, y, player, waypoints = []) {
    super(scene, x, y, player, ENEMY_CONFIG.JELLYFISH.DETECTION_RADIUS);
    
    // Patrol configuration
    this.waypoints = waypoints;
    this.currentWaypointIndex = 0;
    this.waypointReachThreshold = 10; // Distance to consider waypoint "reached"
    
    // Movement speeds
    this.patrolSpeed = ENEMY_CONFIG.JELLYFISH.PATROL_SPEED;
    this.chaseSpeed = ENEMY_CONFIG.JELLYFISH.CHASE_SPEED;
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
   * Execute chase behavior - pursue the player
   * @param {number} delta - Delta time in milliseconds
   */
  chase(delta) {
    const direction = this.getDirectionToPlayer();
    
    this.body.velocity.x = direction.x * this.chaseSpeed;
    this.body.velocity.y = direction.y * this.chaseSpeed;
  }
  
  /**
   * Update visual representation
   */
  updateVisuals() {
    this.graphics.clear();
    
    // Change color based on state
    const color = this.hasTarget ? 0xff00ff : 0x00ffff; // Magenta when chasing, cyan when patrolling
    this.graphics.fillStyle(color, 0.6);
    this.graphics.fillCircle(this.x, this.y, 20);
    
    // Draw tentacles (simple lines)
    this.graphics.lineStyle(2, color, 0.5);
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 * i) / 4;
      const x1 = this.x + Math.cos(angle) * 10;
      const y1 = this.y + Math.sin(angle) * 10;
      const x2 = this.x + Math.cos(angle) * 25;
      const y2 = this.y + Math.sin(angle) * 25;
      
      this.graphics.beginPath();
      this.graphics.moveTo(x1, y1);
      this.graphics.lineTo(x2, y2);
      this.graphics.strokePath();
    }
  }
  
  /**
   * Main update loop
   * @param {number} time - Current game time
   * @param {number} delta - Delta time since last frame
   */
  update(time, delta) {
    if (!this.isActive) return;
    
    // Base enemy update (handles detection)
    super.update(time, delta);
    
    // Behavior based on target state
    if (this.hasTarget) {
      this.chase(delta);
    } else {
      this.patrol(delta);
    }
  }
}
