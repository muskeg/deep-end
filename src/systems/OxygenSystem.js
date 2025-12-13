import { OXYGEN_CONFIG, PLAYER_CONFIG } from '../utils/Constants.js';

/**
 * OxygenSystem
 * Manages oxygen depletion, warnings, and game over conditions
 */
export default class OxygenSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    
    // State
    this.isActive = true;
    this.depletionRate = OXYGEN_CONFIG.BASE_DEPLETION_RATE;
    this.terrainMultiplier = 1.0;
    this.warningEmitted = false;
    this.gameOverEmitted = false;
    this.lastBeepTime = -Infinity; // Start with -Infinity so first warning triggers immediately
    
    // Statistics
    this.totalOxygenConsumed = 0;
    this.timeUnderwater = 0;
  }
  
  /**
   * Update oxygen system
   */
  update(deltaSeconds) {
    if (!this.isActive || this.gameOverEmitted) return;
    
    // Update player oxygen
    const actualDepletion = this.depletionRate * this.terrainMultiplier * deltaSeconds;
    this.player.updateOxygen(deltaSeconds);
    
    // Track statistics
    this.totalOxygenConsumed += actualDepletion;
    this.timeUnderwater += deltaSeconds;
    
    // Check thresholds
    this.checkThresholds();
    this.checkGameOver();
  }
  
  /**
   * Set terrain multiplier for difficult terrain
   */
  setTerrainMultiplier(multiplier) {
    this.terrainMultiplier = Math.max(0, multiplier);
  }
  
  /**
   * Set base depletion rate (for difficulty scaling)
   */
  setDepletionRate(rate) {
    this.depletionRate = Math.max(0, rate);
  }
  
  /**
   * Get current depletion rate
   */
  getDepletionRate() {
    return this.depletionRate * this.terrainMultiplier;
  }
  
  /**
   * Check oxygen thresholds for warnings
   */
  checkThresholds() {
    const currentTime = this.scene.time?.now ?? 0;
    
    if (this.player.oxygen <= OXYGEN_CONFIG.WARNING_THRESHOLD) {
      // Calculate beep interval based on oxygen level (faster as oxygen decreases)
      // At 30% oxygen: beep every 2 seconds
      // At 15% oxygen: beep every 1 second
      // At 5% oxygen: beep every 0.5 seconds
      const oxygenPercent = this.player.oxygen / PLAYER_CONFIG.INITIAL_OXYGEN;
      const beepInterval = Math.max(500, oxygenPercent * 6000); // 500ms to 1800ms
      
      if (currentTime - this.lastBeepTime >= beepInterval) {
        this.scene.events.emit('oxygen-warning', this.player.oxygen);
        this.lastBeepTime = currentTime;
      }
      this.warningEmitted = true;
    } else if (this.player.oxygen > OXYGEN_CONFIG.WARNING_THRESHOLD && this.warningEmitted) {
      // Reset warning flag if oxygen increases above threshold
      this.warningEmitted = false;
      this.lastBeepTime = -Infinity;
    }
  }
  
  /**
   * Check for game over condition
   */
  checkGameOver() {
    if (!this.player.isAlive() && !this.gameOverEmitted) {
      this.gameOverEmitted = true;
      this.isActive = false;
      this.scene.events.emit('game-over', { reason: 'oxygen-depleted' });
    }
  }
  
  /**
   * Handle enemy collision damage
   */
  handleEnemyCollision() {
    const damage = OXYGEN_CONFIG.ENEMY_COLLISION_DAMAGE;
    this.player.oxygen = Math.max(0, this.player.oxygen - damage);
    this.scene.events.emit('oxygen-damage', damage);
  }
  
  /**
   * Pause oxygen depletion
   */
  pause() {
    this.isActive = false;
  }
  
  /**
   * Resume oxygen depletion
   */
  resume() {
    this.isActive = true;
  }
  
  /**
   * Get total oxygen consumed
   */
  getTotalOxygenConsumed() {
    return this.totalOxygenConsumed;
  }
  
  /**
   * Get time underwater
   */
  getTimeUnderwater() {
    return this.timeUnderwater;
  }
  
  /**
   * Reset oxygen system
   */
  reset() {
    this.player.oxygen = PLAYER_CONFIG.INITIAL_OXYGEN;
    this.isActive = true;
    this.warningEmitted = false;
    this.gameOverEmitted = false;
    this.lastBeepTime = -Infinity;
    this.totalOxygenConsumed = 0;
    this.timeUnderwater = 0;
    this.terrainMultiplier = 1.0;
  }
}
