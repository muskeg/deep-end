/**
 * CollisionSystem
 * Handles collision detection and response with sliding
 */
export default class CollisionSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.walls = [];
    this.enemies = [];
    this.isActive = true;
    this.totalCollisions = 0;
    this.totalEnemyCollisions = 0;
    this.lastEnemyCollisionTime = 0;
  }
  
  /**
   * Add a wall to the system
   */
  addWall(wall) {
    this.walls.push(wall);
  }
  
  /**
   * Remove a wall from the system
   */
  removeWall(wall) {
    const index = this.walls.indexOf(wall);
    if (index > -1) {
      this.walls.splice(index, 1);
    }
  }
  
  /**
   * Clear all walls
   */
  clearWalls() {
    this.walls = [];
  }
  
  /**
   * Add an enemy to the system
   */
  addEnemy(enemy) {
    this.enemies.push(enemy);
  }
  
  /**
   * Remove an enemy from the system
   */
  removeEnemy(enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
  }
  
  /**
   * Clear all enemies
   */
  clearEnemies() {
    this.enemies = [];
  }
  
  /**
   * Add an enemy to the system
   */
  addEnemy(enemy) {
    this.enemies.push(enemy);
  }
  
  /**
   * Remove an enemy from the system
   */
  removeEnemy(enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
  }
  
  /**
   * Clear all enemies
   */
  clearEnemies() {
    this.enemies = [];
  }
  
  /**
   * Check collision between player and wall (AABB)
   */
  checkCollision(player, wall) {
    const playerHalfWidth = player.body.width / 2;
    const playerHalfHeight = player.body.height / 2;
    const wallHalfWidth = wall.width / 2;
    const wallHalfHeight = wall.height / 2;
    
    return Math.abs(player.x - wall.x) < playerHalfWidth + wallHalfWidth &&
           Math.abs(player.y - wall.y) < playerHalfHeight + wallHalfHeight;
  }
  
  /**
   * Resolve collision with sliding
   */
  resolveCollision(player, wall) {
    const playerHalfWidth = player.body.width / 2;
    const playerHalfHeight = player.body.height / 2;
    const wallHalfWidth = wall.width / 2;
    const wallHalfHeight = wall.height / 2;
    
    // Calculate overlap on each axis
    const overlapX = (playerHalfWidth + wallHalfWidth) - Math.abs(player.x - wall.x);
    const overlapY = (playerHalfHeight + wallHalfHeight) - Math.abs(player.y - wall.y);
    
    // Resolve on the axis with less overlap (sliding)
    if (overlapX < overlapY) {
      // Horizontal collision - slide vertically
      if (player.x < wall.x) {
        player.x -= overlapX;
      } else {
        player.x += overlapX;
      }
      player.body.velocity.x = 0;
    } else {
      // Vertical collision - slide horizontally
      if (player.y < wall.y) {
        player.y -= overlapY;
      } else {
        player.y += overlapY;
      }
      player.body.velocity.y = 0;
    }
    
    // Corner collision - stop both directions
    const cornerThreshold = 5; // pixels
    if (Math.abs(overlapX - overlapY) < cornerThreshold) {
      player.body.velocity.x = 0;
      player.body.velocity.y = 0;
    }
  }
  
  /**
   * Update system - check and resolve collisions
   */
  update(deltaSeconds) {
    if (!this.isActive) return;
    
    // Check wall collisions
    for (const wall of this.walls) {
      if (this.checkCollision(this.player, wall)) {
        this.resolveCollision(this.player, wall);
        this.totalCollisions++;
        
        this.scene.events.emit('wall-collision', {
          player: this.player,
          wall: wall
        });
      }
    }
    
    // Check enemy collisions with invulnerability period
    const currentTime = this.scene.time.now;
    const invulnerabilityDuration = 1000; // 1 second
    
    if (currentTime - this.lastEnemyCollisionTime >= invulnerabilityDuration) {
      for (const enemy of this.enemies) {
        if (enemy.isActive && this.checkEnemyCollision(this.player, enemy)) {
          this.handleEnemyCollision(enemy);
          this.lastEnemyCollisionTime = currentTime;
          break; // Only process one collision per frame
        }
      }
    }
  }
  
  /**
   * Check collision between player and enemy (circle-circle)
   */
  checkEnemyCollision(player, enemy) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const combinedRadius = 16 + 16; // Player radius + enemy radius
    return distance < combinedRadius;
  }
  
  /**
   * Handle enemy collision
   */
  handleEnemyCollision(enemy) {
    this.totalEnemyCollisions++;
    this.scene.events.emit('enemy-collision', enemy);
    
    // Play sound effect
    if (this.scene.audioManager) {
      this.scene.audioManager.playEnemyHit();
    }
    
    // Trigger oxygen damage via OxygenSystem
    if (this.scene.oxygenSystem) {
      this.scene.oxygenSystem.handleEnemyCollision();
    }
    
    // Visual feedback - flash player
    if (this.player.flashInvulnerable) {
      this.player.flashInvulnerable();
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
   * Get total collision count
   */
  getTotalCollisions() {
    return this.totalCollisions;
  }
  
  /**
   * Get total enemy collision count
   */
  getTotalEnemyCollisions() {
    return this.totalEnemyCollisions;
  }
  
  /**
   * Reset statistics
   */
  reset() {
    this.totalCollisions = 0;
    this.totalEnemyCollisions = 0;
    this.lastEnemyCollisionTime = 0;
  }
}
