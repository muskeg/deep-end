import Phaser from 'phaser';
import { CURRENT_CONFIG, COLORS } from '../utils/Constants.js';

/**
 * WaterCurrent Entity
 * Represents a water current zone that applies force to entities
 */
export default class WaterCurrent extends Phaser.GameObjects.GameObject {
  constructor(scene, x, y, width, height, direction, strength = CURRENT_CONFIG.DEFAULT_STRENGTH) {
    super(scene, 'WaterCurrent');
    
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.strength = strength;
    this.isActive = true;
    
    // Normalize direction vector
    const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    this.direction = {
      x: direction.x / length,
      y: direction.y / length
    };
    
    // Visual representation
    this.graphics = scene.add.graphics();
    this.graphics.setPipeline('Light2D'); // Enable lighting
    this.updateVisuals();
    
    // Particle system for flow visualization
    this.particles = [];
    this.particleTimer = 0;
    this.particleSpawnRate = 100; // milliseconds between particles
    
    scene.add.existing(this);
  }
  
  /**
   * Check if entity is within current's range
   */
  isEntityInRange(entity) {
    if (!this.isActive) return false;
    
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    
    return entity.x >= this.x - halfWidth &&
           entity.x <= this.x + halfWidth &&
           entity.y >= this.y - halfHeight &&
           entity.y <= this.y + halfHeight;
  }
  
  /**
   * Get force vector applied by this current
   */
  getForce() {
    if (!this.isActive) {
      return { x: 0, y: 0 };
    }
    
    return {
      x: this.direction.x * this.strength,
      y: this.direction.y * this.strength
    };
  }
  
  /**
   * Set current active state
   */
  setActive(active) {
    this.isActive = active;
    this.updateVisuals();
  }
  
  /**
   * Set current strength
   */
  setStrength(strength) {
    this.strength = strength;
    this.updateVisuals();
  }
  
  /**
   * Set current direction
   */
  setDirection(direction) {
    const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    this.direction = {
      x: direction.x / length,
      y: direction.y / length
    };
    this.updateVisuals();
  }
  
  /**
   * Update visual representation
   */
  updateVisuals() {
    this.graphics.clear();
    
    if (!this.isActive) {
      return;
    }
    
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    
    // Draw current zone with transparency
    this.graphics.fillStyle(COLORS.CURRENT, CURRENT_CONFIG.VISUAL_ALPHA);
    this.graphics.fillRect(
      this.x - halfWidth,
      this.y - halfHeight,
      this.width,
      this.height
    );
    
    // Draw arrow indicating direction
    const arrowLength = Math.min(this.width, this.height) * 0.4;
    const arrowX = this.direction.x * arrowLength;
    const arrowY = this.direction.y * arrowLength;
    
    this.graphics.lineStyle(3, 0xffffff, 0.8);
    this.graphics.beginPath();
    this.graphics.moveTo(this.x - arrowX / 2, this.y - arrowY / 2);
    this.graphics.lineTo(this.x + arrowX / 2, this.y + arrowY / 2);
    this.graphics.strokePath();
    
    // Arrowhead
    const headSize = 10;
    const angle = Math.atan2(this.direction.y, this.direction.x);
    const tipX = this.x + arrowX / 2;
    const tipY = this.y + arrowY / 2;
    
    this.graphics.fillStyle(0xffffff, 0.8);
    this.graphics.fillTriangle(
      tipX, tipY,
      tipX - headSize * Math.cos(angle - Math.PI / 6),
      tipY - headSize * Math.sin(angle - Math.PI / 6),
      tipX - headSize * Math.cos(angle + Math.PI / 6),
      tipY - headSize * Math.sin(angle + Math.PI / 6)
    );
  }
  
  /**
   * Update loop (for animations and particles)
   */
  update(time, delta) {
    if (!this.isActive) return;
    
    // Spawn flow particles
    this.particleTimer += delta;
    if (this.particleTimer >= this.particleSpawnRate) {
      this.spawnFlowParticle();
      this.particleTimer = 0;
    }
    
    // Update existing particles
    this.particles = this.particles.filter(particle => {
      if (!particle || !particle.active) return false;
      
      // Move particle in current direction
      particle.x += this.direction.x * this.strength * (delta / 16);
      particle.y += this.direction.y * this.strength * (delta / 16);
      
      // Check if particle is still in current zone
      const halfWidth = this.width / 2;
      const halfHeight = this.height / 2;
      const inZone = particle.x >= this.x - halfWidth &&
                     particle.x <= this.x + halfWidth &&
                     particle.y >= this.y - halfHeight &&
                     particle.y <= this.y + halfHeight;
      
      if (!inZone) {
        particle.destroy();
        return false;
      }
      
      return true;
    });
  }
  
  /**
   * Spawn a flow particle to visualize current direction
   */
  spawnFlowParticle() {
    if (!this.scene || !this.scene.add) return;
    
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    
    // Random position within current zone
    const x = this.x + (Math.random() - 0.5) * this.width;
    const y = this.y + (Math.random() - 0.5) * this.height;
    
    // Create particle
    const size = 2 + Math.random() * 2;
    const alpha = 0.3 + Math.random() * 0.3;
    const particle = this.scene.add.circle(x, y, size, COLORS.CURRENT, alpha);
    particle.setDepth(5); // Above water but below most entities
    
    // Add trail effect
    this.scene.tweens.add({
      targets: particle,
      alpha: 0,
      duration: 1500,
      ease: 'Linear',
      onComplete: () => {
        if (particle && particle.active) {
          particle.destroy();
        }
      }
    });
    
    this.particles.push(particle);
  }
  
  /**
   * Cleanup
   */
  destroy() {
    // Destroy all particles
    this.particles.forEach(particle => {
      if (particle && particle.active) {
        particle.destroy();
      }
    });
    this.particles = [];
    
    if (this.graphics) {
      this.graphics.destroy();
    }
    super.destroy();
  }
}
