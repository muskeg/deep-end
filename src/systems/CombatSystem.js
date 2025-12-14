/**
 * CombatSystem - Manages damage calculations and combat events
 */

import Pearl from '../entities/Pearl.js';

export default class CombatSystem {
  constructor(scene) {
    this.scene = scene;
  }
  
  /**
   * Deal damage to an entity
   * @param {Enemy} entity - The entity to damage
   * @param {number} amount - Amount of damage to deal
   * @returns {boolean} True if entity was killed
   */
  dealDamage(entity, amount) {
    if (!entity || !entity.takeDamage) {
      console.warn('CombatSystem: Entity does not have takeDamage method');
      return false;
    }
    
    const wasKilled = entity.takeDamage(amount);
    
    if (wasKilled) {
      this.onEnemyKilled(entity);
    }
    
    return wasKilled;
  }
  
  /**
   * Handle enemy death
   * @param {Enemy} enemy - The enemy that was killed
   */
  onEnemyKilled(enemy) {
    console.log(`${enemy.constructor.name} killed at (${enemy.x.toFixed(0)}, ${enemy.y.toFixed(0)})`);
    
    // Get current zone to determine pearl value
    const currentZone = this.scene.depthZoneSystem?.getCurrentZone(enemy.y);
    const pearlValue = currentZone ? this.scene.depthZoneSystem.getPearlValue(currentZone) : 1;
    
    // Spawn pearl at enemy position
    const pearl = new Pearl(this.scene, enemy.x, enemy.y, pearlValue);
    this.scene.pearls.push(pearl);
    
    // Setup collision with player
    this.scene.physics.add.overlap(this.scene.player, pearl, () => {
      if (!pearl.wasCollected()) {
        pearl.collect();
      }
    });
    
    // Update statistics
    if (this.scene.progressionSystem) {
      this.scene.progressionSystem.incrementStat('enemiesKilled');
    }
    
    // Create death effect
    this.createDeathEffect(enemy);
    
    // Remove from enemies array
    const index = this.scene.enemies.indexOf(enemy);
    if (index > -1) {
      this.scene.enemies.splice(index, 1);
    }
    
    // Remove from collision system
    if (this.scene.collisionSystem) {
      this.scene.collisionSystem.removeEnemy(enemy);
    }
  }
  
  /**
   * Create visual effect for enemy death
   * @param {Enemy} enemy - The enemy that died
   */
  createDeathEffect(enemy) {
    // Play death sound
    if (this.scene.audioManager) {
      this.scene.audioManager.playEnemyHit(); // Use hit sound for now, could add dedicated death sound
    }
    
    // Central flash effect
    const flash = this.scene.add.circle(enemy.x, enemy.y, 30, 0xFFFFFF, 0.8);
    flash.setPipeline('Light2D');
    flash.setDepth(100);
    
    this.scene.tweens.add({
      targets: flash,
      scale: 3,
      alpha: 0,
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => flash.destroy()
    });
    
    // Explosion ring
    const ring = this.scene.add.circle(enemy.x, enemy.y, 35, enemy.color || 0xFF6B6B, 0);
    ring.setStrokeStyle(3, enemy.color || 0xFF6B6B, 1);
    ring.setPipeline('Light2D');
    ring.setDepth(100);
    
    this.scene.tweens.add({
      targets: ring,
      scale: 2.5,
      alpha: 0,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy()
    });
    
    // Large particle explosion (outer burst)
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16;
      const distance = 60 + Math.random() * 40;
      const color = i % 2 === 0 ? (enemy.color || 0xFF6B6B) : 0xFFAA00;
      
      const particle = this.scene.add.circle(
        enemy.x,
        enemy.y,
        4 + Math.random() * 4,
        color,
        0.9
      );
      particle.setPipeline('Light2D');
      particle.setDepth(100);
      
      this.scene.tweens.add({
        targets: particle,
        x: enemy.x + Math.cos(angle) * distance,
        y: enemy.y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.2,
        duration: 600 + Math.random() * 300,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy()
      });
    }
    
    // Small particle debris (inner burst)
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 30;
      
      const particle = this.scene.add.circle(
        enemy.x,
        enemy.y,
        2 + Math.random() * 2,
        0xFFFFFF,
        0.8
      );
      particle.setPipeline('Light2D');
      particle.setDepth(100);
      
      this.scene.tweens.add({
        targets: particle,
        x: enemy.x + Math.cos(angle) * distance,
        y: enemy.y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.1,
        duration: 400 + Math.random() * 200,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy()
      });
    }
  }
}
