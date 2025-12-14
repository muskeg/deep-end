/**
 * Harpoon - Player's ranged weapon projectile
 * Fires in a direction, travels until max range or collision
 */

import Phaser from 'phaser';
import { COMBAT_CONFIG, COLORS } from '../utils/Constants.js';

export default class Harpoon extends Phaser.Physics.Arcade.Sprite {
  /**
   * Create a harpoon projectile
   * @param {Phaser.Scene} scene - The scene this harpoon belongs to
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position
   */
  constructor(scene, x, y) {
    super(scene, x, y);
    
    this.scene = scene;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Combat properties
    this.damage = COMBAT_CONFIG.HARPOON.DAMAGE;
    this.speed = COMBAT_CONFIG.HARPOON.SPEED;
    this.maxRange = COMBAT_CONFIG.HARPOON.RANGE;
    this.distanceTraveled = 0;
    this.startPosition = { x, y };
    
    // State
    this.active = false;
    this.hasHit = false;
    
    // Graphics
    this.graphics = scene.add.graphics();
    this.graphics.setPipeline('Light2D');
    this.updateVisuals();
    
    // Physics
    this.body.setSize(30, 6);
    this.body.setAllowGravity(false);
    
    // Trail effect
    this.trailParticles = [];
  }
  
  /**
   * Fire the harpoon in a direction
   * @param {number} directionX - X component of direction vector (-1 to 1)
   * @param {number} directionY - Y component of direction vector (-1 to 1)
   * @param {number} damageBonus - Additional damage from upgrades
   */
  fire(directionX, directionY, damageBonus = 0) {
    // Normalize direction
    const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
    if (magnitude === 0) return;
    
    const normalizedX = directionX / magnitude;
    const normalizedY = directionY / magnitude;
    
    // Set velocity
    this.body.setVelocity(
      normalizedX * this.speed,
      normalizedY * this.speed
    );
    
    // Set rotation to face direction
    this.rotation = Math.atan2(normalizedY, normalizedX);
    
    // Apply damage bonus
    this.damage += damageBonus;
    
    // Activate
    this.active = true;
    this.hasHit = false;
    this.startPosition = { x: this.x, y: this.y };
    this.distanceTraveled = 0;
    
    console.log(`Harpoon fired: direction=(${normalizedX.toFixed(2)}, ${normalizedY.toFixed(2)}), damage=${this.damage}`);
  }
  
  /**
   * Update harpoon state
   * @param {number} time - Current scene time
   * @param {number} delta - Delta time in milliseconds
   */
  update(time, delta) {
    if (!this.active) return;
    
    // Update visuals position
    this.updateVisuals();
    
    // Calculate distance traveled
    const dx = this.x - this.startPosition.x;
    const dy = this.y - this.startPosition.y;
    this.distanceTraveled = Math.sqrt(dx * dx + dy * dy);
    
    // Check if exceeded max range
    if (this.distanceTraveled >= this.maxRange) {
      this.destroy();
      return;
    }
    
    // Create trail effect
    if (this.scene.time.now % 50 < delta) {
      this.createTrailParticle();
    }
    
    // Clean up old trail particles
    this.trailParticles = this.trailParticles.filter(particle => {
      if (particle.alpha <= 0) {
        particle.destroy();
        return false;
      }
      return true;
    });
  }
  
  /**
   * Create a trail particle behind the harpoon
   */
  createTrailParticle() {
    const particle = this.scene.add.circle(
      this.x - Math.cos(this.rotation) * 10,
      this.y - Math.sin(this.rotation) * 10,
      3,
      COLORS.HARPOON,
      0.6
    );
    particle.setPipeline('Light2D');
    
    this.scene.tweens.add({
      targets: particle,
      alpha: 0,
      scale: 0.3,
      duration: 300,
      ease: 'Cubic.easeOut'
    });
    
    this.trailParticles.push(particle);
  }
  
  /**
   * Update visual representation
   */
  updateVisuals() {
    this.graphics.clear();
    
    // Position graphics at harpoon location
    this.graphics.x = this.x;
    this.graphics.y = this.y;
    this.graphics.rotation = this.rotation;
    
    // Draw harpoon shaft
    this.graphics.fillStyle(COLORS.HARPOON, 1);
    this.graphics.fillRect(-15, -2, 25, 4);
    
    // Draw harpoon tip
    this.graphics.fillStyle(COLORS.HARPOON_TIP || 0xCCCCCC, 1);
    this.graphics.beginPath();
    this.graphics.moveTo(10, 0);
    this.graphics.lineTo(5, -4);
    this.graphics.lineTo(5, 4);
    this.graphics.closePath();
    this.graphics.fillPath();
  }
  
  /**
   * Handle collision with an enemy
   * @param {Enemy} enemy - The enemy that was hit
   * @returns {number} Damage dealt
   */
  onEnemyCollision(enemy) {
    if (this.hasHit) return 0;
    
    this.hasHit = true;
    
    console.log(`Harpoon hit ${enemy.constructor.name} for ${this.damage} damage`);
    
    // Create hit effect
    this.createHitEffect();
    
    // Destroy the harpoon
    this.destroy();
    
    return this.damage;
  }
  
  /**
   * Create visual effect on hit
   */
  createHitEffect() {
    // Spawn impact particles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const particle = this.scene.add.circle(
        this.x,
        this.y,
        4,
        COLORS.HARPOON_TIP || 0xFFFFFF,
        0.8
      );
      particle.setPipeline('Light2D');
      
      const speed = 100 + Math.random() * 50;
      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Math.cos(angle) * speed * 0.3,
        y: particle.y + Math.sin(angle) * speed * 0.3,
        alpha: 0,
        scale: 0.2,
        duration: 400,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy()
      });
    }
  }
  
  /**
   * Clean up harpoon and graphics
   */
  destroy() {
    this.active = false;
    
    // Clean up trail particles
    this.trailParticles.forEach(particle => particle.destroy());
    this.trailParticles = [];
    
    // Clean up graphics
    if (this.graphics) {
      this.graphics.destroy();
    }
    
    // Remove from scene
    super.destroy();
  }
}
