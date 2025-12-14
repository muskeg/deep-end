import Phaser from 'phaser';
import { PLAYER_CONFIG, OXYGEN_CONFIG, COLORS } from '../utils/Constants.js';

/**
 * Player Entity
 * Controllable diver character with movement, oxygen management, and pearl collection
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, upgradeParams = {}) {
    super(scene, x, y);
    
    this.scene = scene;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Visual representation (circle for now)
    this.graphics = scene.add.graphics();
    this.graphics.setPipeline('Light2D'); // Enable lighting
    this.updateVisuals();
    
    // Physics properties
    this.setCollideWorldBounds(true);
    this.body.setCircle(PLAYER_CONFIG.COLLISION_RADIUS);
    
    // Upgrade multipliers and bonuses (from UpgradeSystem)
    this.oxygenMultiplier = upgradeParams.oxygenMultiplier || 1.0;
    this.lightMultiplier = upgradeParams.lightMultiplier || 1.0;
    this.speedMultiplier = upgradeParams.speedMultiplier || 1.0;
    this.harpoonDamageBonus = upgradeParams.harpoonDamageBonus || 0;
    this.dashCooldownReduction = upgradeParams.dashCooldownReduction || 0;
    this.sonarRangeBonus = upgradeParams.sonarRangeBonus || 0;
    
    // Game state
    this.oxygen = PLAYER_CONFIG.INITIAL_OXYGEN * this.oxygenMultiplier;
    this.maxOxygen = PLAYER_CONFIG.INITIAL_OXYGEN * this.oxygenMultiplier;
    this.score = 0;
    this.pearlsCollected = 0;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = null;
    
    // Track position for graphics
    this.lastX = x;
    this.lastY = y;
  }
  
  /**
   * Handle player movement based on input
   */
  handleMovement(input) {
    let velocityX = 0;
    let velocityY = 0;
    
    if (input.left) velocityX -= 1;
    if (input.right) velocityX += 1;
    if (input.up) velocityY -= 1;
    if (input.down) velocityY += 1;
    
    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      velocityX /= magnitude;
      velocityY /= magnitude;
    }
    
    // Apply speed with upgrade multiplier
    const speed = PLAYER_CONFIG.SPEED * this.speedMultiplier;
    this.body.velocity.x = velocityX * speed;
    this.body.velocity.y = velocityY * speed;
  }
  
  /**
   * Update oxygen level over time
   */
  updateOxygen(deltaSeconds) {
    const depletion = OXYGEN_CONFIG.BASE_DEPLETION_RATE * deltaSeconds;
    this.oxygen = Math.max(0, this.oxygen - depletion);
    
    if (this.oxygen === 0) {
      this.scene.events.emit('oxygen-depleted');
    } else if (this.oxygen <= OXYGEN_CONFIG.WARNING_THRESHOLD) {
      this.scene.events.emit('oxygen-warning', this.oxygen);
    }
  }
  
  /**
   * Take oxygen damage (from enemies or hazards)
   */
  takeDamage(amount) {
    if (this.isInvulnerable) return;
    
    this.oxygen = Math.max(0, this.oxygen - amount);
    this.isInvulnerable = true;
    
    // Clear existing timer
    if (this.invulnerabilityTimer) {
      clearTimeout(this.invulnerabilityTimer);
    }
    
    // Set invulnerability duration
    this.invulnerabilityTimer = setTimeout(() => {
      this.isInvulnerable = false;
    }, 1000);
  }
  
  /**
   * Collect a pearl
   */
  collectPearl(value) {
    this.score += value;
    this.pearlsCollected++;
    this.scene.events.emit('score-changed', this.score);
  }
  
  /**
   * Check if player can interact with an object
   */
  canInteractWith(object) {
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      object.x, object.y
    );
    return distance <= PLAYER_CONFIG.INTERACTION_RADIUS;
  }
  
  /**
   * Check if player is alive
   */
  isAlive() {
    return this.oxygen > 0;
  }
  
  /**
   * Update visual representation
   */
  updateVisuals() {
    this.graphics.clear();
    
    // Draw player circle
    const alpha = this.isInvulnerable ? 0.5 : 1.0;
    this.graphics.fillStyle(COLORS.PLAYER, alpha);
    this.graphics.fillCircle(this.x, this.y, PLAYER_CONFIG.COLLISION_RADIUS);
  }
  
  /**
   * Update loop
   */
  update(time, delta) {
    // Update graphics position
    if (this.x !== this.lastX || this.y !== this.lastY) {
      this.updateVisuals();
      this.lastX = this.x;
      this.lastY = this.y;
    }
  }
  
  /**
   * Cleanup
   */
  destroy() {
    if (this.invulnerabilityTimer) {
      clearTimeout(this.invulnerabilityTimer);
    }
    if (this.graphics) {
      this.graphics.destroy();
    }
    super.destroy();
  }
  
  /**
   * Flash invulnerability visual feedback
   */
  flashInvulnerable() {
    // Flash the player sprite/graphics
    const flashDuration = 1000; // 1 second
    const flashInterval = 100; // Flash every 100ms
    let flashCount = 0;
    const maxFlashes = flashDuration / flashInterval;
    
    const flashTimer = this.scene.time.addEvent({
      delay: flashInterval,
      callback: () => {
        this.alpha = this.alpha === 1 ? 0.3 : 1;
        flashCount++;
        
        if (flashCount >= maxFlashes) {
          this.alpha = 1;
          flashTimer.remove();
        }
      },
      loop: true
    });
  }
}
