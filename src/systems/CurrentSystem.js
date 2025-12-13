/**
 * CurrentSystem
 * Manages water currents and applies forces to entities
 */
export default class CurrentSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.currents = [];
    this.isActive = true;
    this.totalTimeInCurrents = 0;
    this.activeCurrents = new Set(); // Track which currents player is currently in
  }
  
  /**
   * Add a current to the system
   */
  addCurrent(current) {
    this.currents.push(current);
  }
  
  /**
   * Remove a current from the system
   */
  removeCurrent(current) {
    const index = this.currents.indexOf(current);
    if (index > -1) {
      this.currents.splice(index, 1);
    }
  }
  
  /**
   * Clear all currents
   */
  clearCurrents() {
    this.currents = [];
    this.activeCurrents.clear();
  }
  
  /**
   * Update system - apply forces from currents
   */
  update(deltaSeconds) {
    if (!this.isActive) return;
    
    let totalForce = { x: 0, y: 0 };
    let inAnyCurrent = false;
    
    // Check each current
    for (const current of this.currents) {
      if (current.isEntityInRange(this.player)) {
        inAnyCurrent = true;
        
        // Emit enter event if newly entered
        if (!this.activeCurrents.has(current)) {
          this.activeCurrents.add(current);
          this.scene.events.emit('player-entered-current', current);
        }
        
        // Add force from this current
        const force = current.getForce();
        totalForce.x += force.x;
        totalForce.y += force.y;
        
        // Track time in currents
        this.totalTimeInCurrents += deltaSeconds;
      } else {
        // Emit exit event if was in current
        if (this.activeCurrents.has(current)) {
          this.activeCurrents.delete(current);
          this.scene.events.emit('player-exited-current', current);
        }
      }
    }
    
    // Apply combined force to player velocity
    if (inAnyCurrent) {
      this.player.body.velocity.x = totalForce.x;
      this.player.body.velocity.y = totalForce.y;
    }
  }
  
  /**
   * Pause the system
   */
  pause() {
    this.isActive = false;
  }
  
  /**
   * Resume the system
   */
  resume() {
    this.isActive = true;
  }
  
  /**
   * Get total time player has spent in currents
   */
  getTotalTimeInCurrents() {
    return this.totalTimeInCurrents;
  }
  
  /**
   * Reset statistics and state
   */
  reset() {
    this.totalTimeInCurrents = 0;
    this.activeCurrents.clear();
  }
}
