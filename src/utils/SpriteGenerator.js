/**
 * SpriteGenerator - Generate procedural textures for game entities
 */
export default class SpriteGenerator {
  /**
   * Generate diver sprite textures
   * @param {Phaser.Scene} scene - The scene to generate textures in
   */
  static generateDiverSprites(scene) {
    const size = 32;
    const bodyColor = 0x0088cc; // Diving suit blue
    const helmetColor = 0xcccccc; // Silver helmet
    const glassColor = 0x88ddff; // Light blue visor
    const tankColor = 0x666666; // Gray oxygen tank
    
    // Generate idle animation frames (8 directions)
    const directions = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];
    
    directions.forEach((direction, index) => {
      // Create texture
      const texture = scene.textures.createCanvas(`diver-idle-${direction}`, size, size);
      const ctx = texture.getContext();
      const centerX = size / 2;
      const centerY = size / 2;
      
      // Clear canvas
      ctx.clearRect(0, 0, size, size);
      
      this.drawDiver(ctx, centerX, centerY, direction, bodyColor, helmetColor, glassColor, tankColor);
      
      // Update texture
      texture.refresh();
    });
    
    // Generate swim animation frames (2 frame simple bob)
    for (let frame = 0; frame < 2; frame++) {
      const bobOffset = frame === 0 ? 0 : 1;
      
      directions.forEach((direction, index) => {
        const texture = scene.textures.createCanvas(`diver-swim-${direction}-${frame}`, size, size);
        const ctx = texture.getContext();
        const centerX = size / 2;
        const centerY = size / 2 + bobOffset;
        
        ctx.clearRect(0, 0, size, size);
        
        this.drawDiver(ctx, centerX, centerY, direction, bodyColor, helmetColor, glassColor, tankColor);
        
        texture.refresh();
      });
    }
  }
  
  /**
   * Draw a diver sprite in a specific direction
   */
  static drawDiver(ctx, centerX, centerY, direction, bodyColor, helmetColor, glassColor, tankColor) {
    // Calculate offsets based on direction
    let headX = centerX, headY = centerY, bodyX = centerX, bodyY = centerY;
    let tankX = centerX, tankY = centerY;
    let flipperX1, flipperY1, flipperX2, flipperY2;
    let armX1, armY1, armX2, armY2;
    
    switch(direction) {
      case 'down':
        headY = centerY + 8;
        bodyY = centerY + 2;
        tankY = centerY + 1;
        flipperX1 = centerX - 3; flipperY1 = centerY - 8;
        flipperX2 = centerX + 3; flipperY2 = centerY - 8;
        armX1 = centerX - 9; armY1 = centerY + 2;
        armX2 = centerX + 9; armY2 = centerY + 2;
        break;
      case 'up':
        headY = centerY - 8;
        bodyY = centerY - 2;
        tankY = centerY - 1;
        flipperX1 = centerX - 3; flipperY1 = centerY + 8;
        flipperX2 = centerX + 3; flipperY2 = centerY + 8;
        armX1 = centerX - 9; armY1 = centerY - 2;
        armX2 = centerX + 9; armY2 = centerY - 2;
        break;
      case 'left':
        headX = centerX - 8;
        bodyX = centerX - 2;
        tankX = centerX - 1;
        flipperX1 = centerX + 8; flipperY1 = centerY - 3;
        flipperX2 = centerX + 8; flipperY2 = centerY + 3;
        armX1 = centerX - 2; armY1 = centerY - 9;
        armX2 = centerX - 2; armY2 = centerY + 9;
        break;
      case 'right':
        headX = centerX + 8;
        bodyX = centerX + 2;
        tankX = centerX + 1;
        flipperX1 = centerX - 8; flipperY1 = centerY - 3;
        flipperX2 = centerX - 8; flipperY2 = centerY + 3;
        armX1 = centerX + 2; armY1 = centerY - 9;
        armX2 = centerX + 2; armY2 = centerY + 9;
        break;
      case 'down-right':
        headX = centerX + 6; headY = centerY + 6;
        bodyX = centerX + 2; bodyY = centerY + 2;
        tankX = centerX + 1; tankY = centerY + 1;
        flipperX1 = centerX - 6; flipperY1 = centerY - 6;
        flipperX2 = centerX - 5; flipperY2 = centerY - 5;
        armX1 = centerX - 4; armY1 = centerY + 8;
        armX2 = centerX + 8; armY2 = centerY - 4;
        break;
      case 'down-left':
        headX = centerX - 6; headY = centerY + 6;
        bodyX = centerX - 2; bodyY = centerY + 2;
        tankX = centerX - 1; tankY = centerY + 1;
        flipperX1 = centerX + 6; flipperY1 = centerY - 6;
        flipperX2 = centerX + 5; flipperY2 = centerY - 5;
        armX1 = centerX + 4; armY1 = centerY + 8;
        armX2 = centerX - 8; armY2 = centerY - 4;
        break;
      case 'up-right':
        headX = centerX + 6; headY = centerY - 6;
        bodyX = centerX + 2; bodyY = centerY - 2;
        tankX = centerX + 1; tankY = centerY - 1;
        flipperX1 = centerX - 6; flipperY1 = centerY + 6;
        flipperX2 = centerX - 5; flipperY2 = centerY + 5;
        armX1 = centerX - 4; armY1 = centerY - 8;
        armX2 = centerX + 8; armY2 = centerY + 4;
        break;
      case 'up-left':
        headX = centerX - 6; headY = centerY - 6;
        bodyX = centerX - 2; bodyY = centerY - 2;
        tankX = centerX - 1; tankY = centerY - 1;
        flipperX1 = centerX + 6; flipperY1 = centerY + 6;
        flipperX2 = centerX + 5; flipperY2 = centerY + 5;
        armX1 = centerX + 4; armY1 = centerY - 8;
        armX2 = centerX - 8; armY2 = centerY + 4;
        break;
    }
    
    // Draw oxygen tank (behind body)
    ctx.fillStyle = '#' + tankColor.toString(16).padStart(6, '0');
    ctx.beginPath();
    if (direction === 'left' || direction === 'right') {
      ctx.ellipse(tankX, tankY, 8, 5, 0, 0, Math.PI * 2);
    } else {
      ctx.ellipse(tankX, tankY, 5, 8, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    
    // Draw body (oval)
    ctx.fillStyle = '#' + bodyColor.toString(16).padStart(6, '0');
    ctx.beginPath();
    if (direction === 'left' || direction === 'right') {
      ctx.ellipse(bodyX, bodyY, 10, 7, 0, 0, Math.PI * 2);
    } else {
      ctx.ellipse(bodyX, bodyY, 7, 10, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    
    // Draw arms
    ctx.strokeStyle = '#' + bodyColor.toString(16).padStart(6, '0');
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bodyX, bodyY);
    ctx.lineTo(armX1, armY1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bodyX, bodyY);
    ctx.lineTo(armX2, armY2);
    ctx.stroke();
    
    // Draw flippers (legs)
    ctx.fillStyle = '#' + bodyColor.toString(16).padStart(6, '0');
    ctx.beginPath();
    if (direction === 'left' || direction === 'right') {
      ctx.ellipse(flipperX1, flipperY1, 5, 3, 0, 0, Math.PI * 2);
    } else {
      ctx.ellipse(flipperX1, flipperY1, 3, 5, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.beginPath();
    if (direction === 'left' || direction === 'right') {
      ctx.ellipse(flipperX2, flipperY2, 5, 3, 0, 0, Math.PI * 2);
    } else {
      ctx.ellipse(flipperX2, flipperY2, 3, 5, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    
    // Draw helmet (circle)
    ctx.fillStyle = '#' + helmetColor.toString(16).padStart(6, '0');
    ctx.beginPath();
    ctx.arc(headX, headY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw visor (glass)
    ctx.fillStyle = '#' + glassColor.toString(16).padStart(6, '0');
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(headX, headY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
    
    // Visor highlight
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    const highlightOffsetX = direction.includes('left') ? 2 : -2;
    const highlightOffsetY = direction.includes('up') ? 2 : -2;
    ctx.arc(headX + highlightOffsetX, headY + highlightOffsetY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
  
  /**
   * Get direction name from velocity
   * @param {number} vx - X velocity
   * @param {number} vy - Y velocity
   * @returns {string} Direction name
   */
  static getDirectionFromVelocity(vx, vy) {
    if (vx === 0 && vy === 0) return 'down'; // Default
    
    const angle = Math.atan2(vy, vx);
    const degrees = angle * (180 / Math.PI);
    const normalized = (degrees + 360) % 360;
    
    // 8-direction mapping
    if (normalized >= 337.5 || normalized < 22.5) return 'right';
    if (normalized >= 22.5 && normalized < 67.5) return 'down-right';
    if (normalized >= 67.5 && normalized < 112.5) return 'down';
    if (normalized >= 112.5 && normalized < 157.5) return 'down-left';
    if (normalized >= 157.5 && normalized < 202.5) return 'left';
    if (normalized >= 202.5 && normalized < 247.5) return 'up-left';
    if (normalized >= 247.5 && normalized < 292.5) return 'up';
    if (normalized >= 292.5 && normalized < 337.5) return 'up-right';
    
    return 'down';
  }
  
  /**
   * Generate jellyfish sprite textures
   * @param {Phaser.Scene} scene - The scene to generate textures in
   */
  static generateJellyfishSprites(scene) {
    const size = 48;
    const bodyColor = 0xff69b4; // Pink
    const tentacleColor = 0xff1493; // Deep pink
    
    // Generate animation frames (pulsing effect)
    for (let frame = 0; frame < 3; frame++) {
      const texture = scene.textures.createCanvas(`jellyfish-${frame}`, size, size);
      const ctx = texture.getContext();
      const centerX = size / 2;
      const centerY = size / 2;
      
      ctx.clearRect(0, 0, size, size);
      
      // Pulsing scale
      const pulseScale = 1 + (frame * 0.1);
      const bellRadius = 12 * pulseScale;
      
      // Draw bell (dome shape)
      ctx.fillStyle = '#' + bodyColor.toString(16).padStart(6, '0');
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 4, bellRadius, bellRadius * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
      
      // Draw bell highlights
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.ellipse(centerX - 4, centerY - 8, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
      
      // Draw tentacles (8 wavy lines)
      ctx.strokeStyle = '#' + tentacleColor.toString(16).padStart(6, '0');
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.7;
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const startX = centerX + Math.cos(angle) * (bellRadius * 0.6);
        const startY = centerY + Math.sin(angle) * (bellRadius * 0.4) + 2;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        // Wavy tentacle with frame animation
        const waveOffset = (frame - 1) * 2;
        for (let j = 1; j <= 3; j++) {
          const segX = startX + Math.cos(angle) * j * 2 + Math.sin(j + frame) * waveOffset;
          const segY = startY + j * 4;
          ctx.lineTo(segX, segY);
        }
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1.0;
      texture.refresh();
    }
    
    console.log('[SpriteGenerator] Generated jellyfish sprites');
  }
  
  /**
   * Generate eel sprite textures
   * @param {Phaser.Scene} scene - The scene to generate textures in
   */
  static generateEelSprites(scene) {
    const width = 64;
    const height = 32;
    const bodyColor = 0x2d5016; // Dark green
    const bellyColor = 0x8fbc8f; // Light green
    const eyeColor = 0xffff00; // Yellow
    
    // Generate for 4 main directions
    const directions = ['left', 'right', 'up', 'down'];
    
    directions.forEach(direction => {
      // Generate swim animation frames (2 frames - serpentine motion)
      for (let frame = 0; frame < 2; frame++) {
        const isHorizontal = direction === 'left' || direction === 'right';
        const texWidth = isHorizontal ? width : height;
        const texHeight = isHorizontal ? height : width;
        
        const texture = scene.textures.createCanvas(`eel-${direction}-${frame}`, texWidth, texHeight);
        const ctx = texture.getContext();
        const centerX = texWidth / 2;
        const centerY = texHeight / 2;
        
        ctx.clearRect(0, 0, texWidth, texHeight);
        
        // Wave offset for animation
        const wavePhase = frame * Math.PI;
        
        if (isHorizontal) {
          // Draw horizontal eel
          const headX = direction === 'right' ? texWidth - 12 : 12;
          const tailX = direction === 'right' ? 8 : texWidth - 8;
          
          // Body segments
          ctx.fillStyle = '#' + bodyColor.toString(16).padStart(6, '0');
          const segments = 8;
          
          for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const x = headX + (tailX - headX) * t;
            const waveY = Math.sin(t * Math.PI * 2 + wavePhase) * 4;
            const segmentWidth = 8 - (t * 2);
            
            ctx.beginPath();
            ctx.ellipse(x, centerY + waveY, segmentWidth, 6, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // Belly stripe
          ctx.strokeStyle = '#' + bellyColor.toString(16).padStart(6, '0');
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(headX, centerY);
          for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const x = headX + (tailX - headX) * t;
            const waveY = Math.sin(t * Math.PI * 2 + wavePhase) * 4;
            ctx.lineTo(x, centerY + waveY);
          }
          ctx.stroke();
          
          // Head details
          ctx.fillStyle = '#' + bodyColor.toString(16).padStart(6, '0');
          ctx.beginPath();
          ctx.ellipse(headX, centerY, 8, 7, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Eye
          const eyeX = direction === 'right' ? headX - 2 : headX + 2;
          ctx.fillStyle = '#' + eyeColor.toString(16).padStart(6, '0');
          ctx.beginPath();
          ctx.arc(eyeX, centerY - 2, 2, 0, Math.PI * 2);
          ctx.fill();
          
          // Pupil
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(eyeX, centerY - 2, 1, 0, Math.PI * 2);
          ctx.fill();
          
        } else {
          // Draw vertical eel
          const headY = direction === 'down' ? texHeight - 12 : 12;
          const tailY = direction === 'down' ? 8 : texHeight - 8;
          
          // Body segments
          ctx.fillStyle = '#' + bodyColor.toString(16).padStart(6, '0');
          const segments = 8;
          
          for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const y = headY + (tailY - headY) * t;
            const waveX = Math.sin(t * Math.PI * 2 + wavePhase) * 4;
            const segmentHeight = 8 - (t * 2);
            
            ctx.beginPath();
            ctx.ellipse(centerX + waveX, y, 6, segmentHeight, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // Belly stripe
          ctx.strokeStyle = '#' + bellyColor.toString(16).padStart(6, '0');
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(centerX, headY);
          for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const y = headY + (tailY - headY) * t;
            const waveX = Math.sin(t * Math.PI * 2 + wavePhase) * 4;
            ctx.lineTo(centerX + waveX, y);
          }
          ctx.stroke();
          
          // Head details
          ctx.fillStyle = '#' + bodyColor.toString(16).padStart(6, '0');
          ctx.beginPath();
          ctx.ellipse(centerX, headY, 7, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Eye
          const eyeY = direction === 'down' ? headY - 2 : headY + 2;
          ctx.fillStyle = '#' + eyeColor.toString(16).padStart(6, '0');
          ctx.beginPath();
          ctx.arc(centerX + 2, eyeY, 2, 0, Math.PI * 2);
          ctx.fill();
          
          // Pupil
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(centerX + 2, eyeY, 1, 0, Math.PI * 2);
          ctx.fill();
        }
        
        texture.refresh();
      }
    });
    
    console.log('[SpriteGenerator] Generated eel sprites');
  }
}
