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
   * Check collision between entity and wall (AABB)
   */
  checkEntityWallCollision(entity, wall) {
    const entityHalfWidth = (entity.body?.width || 32) / 2;
    const entityHalfHeight = (entity.body?.height || 32) / 2;
    const wallHalfWidth = wall.width / 2;
    const wallHalfHeight = wall.height / 2;
    
    return Math.abs(entity.x - wall.x) < entityHalfWidth + wallHalfWidth &&
           Math.abs(entity.y - wall.y) < entityHalfHeight + wallHalfHeight;
  }
  
  /**
   * Resolve entity-wall collision with sliding
   */
  resolveEntityWallCollision(entity, wall) {
    const entityHalfWidth = (entity.body?.width || 32) / 2;
    const entityHalfHeight = (entity.body?.height || 32) / 2;
    const wallHalfWidth = wall.width / 2;
    const wallHalfHeight = wall.height / 2;
    
    // Calculate overlap on each axis
    const overlapX = (entityHalfWidth + wallHalfWidth) - Math.abs(entity.x - wall.x);
    const overlapY = (entityHalfHeight + wallHalfHeight) - Math.abs(entity.y - wall.y);
    
    // Resolve on the axis with less overlap (sliding)
    if (overlapX < overlapY) {
      // Horizontal collision - slide vertically
      if (entity.x < wall.x) {
        entity.x -= overlapX;
      } else {
        entity.x += overlapX;
      }
      if (entity.body) {
        entity.body.velocity.x = 0;
      }
    } else {
      // Vertical collision - slide horizontally
      if (entity.y < wall.y) {
        entity.y -= overlapY;
      } else {
        entity.y += overlapY;
      }
      if (entity.body) {
        entity.body.velocity.y = 0;
      }
    }
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
    
    // Check player-wall collisions
    for (const wall of this.walls) {
      if (this.checkEntityWallCollision(this.player, wall)) {
        this.resolveEntityWallCollision(this.player, wall);
        this.totalCollisions++;
        
        this.scene.events.emit('wall-collision', {
          player: this.player,
          wall: wall
        });
      }
    }
    
    // Check enemy-wall collisions
    for (const enemy of this.enemies) {
      if (!enemy.isActive) continue;
      
      for (const wall of this.walls) {
        if (this.checkEntityWallCollision(enemy, wall)) {
          this.resolveEntityWallCollision(enemy, wall);
        }
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
    
    // Screen shake effect
    if (this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.shake(200, 0.01); // 200ms duration, 0.01 intensity
    }
    
    // Create impact particles
    this.createImpactParticles(this.player.x, this.player.y);
    
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
   * Create impact particles at collision point
   */
  createImpactParticles(x, y) {
    if (!this.scene || !this.scene.add) return;
    
    const particleCount = 12;
    const colors = [0xFF0000, 0xFF6600, 0xFFAA00]; // Red, orange, yellow
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 80 + Math.random() * 60;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 4 + Math.random() * 3;
      
      const particle = this.scene.add.circle(x, y, size, color, 1);
      particle.setDepth(100);
      
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * (40 + Math.random() * 30),
        y: y + Math.sin(angle) * (40 + Math.random() * 30),
        alpha: 0,
        scale: 0.1,
        duration: 400 + Math.random() * 200,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy()
      });
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
