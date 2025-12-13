/**
 * ScoreDisplay UI Component
 * Displays current score and pearl count
 */
export default class ScoreDisplay {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    
    // Background
    this.background = scene.add.graphics();
    this.background.fillStyle(0x000000, 0.7);
    this.background.fillRoundedRect(x, y, 150, 50, 5);
    this.background.setDepth(1000);
    
    // Level text
    this.levelText = scene.add.text(x + 10, y + 7, 'Level: 1', {
      font: '16px monospace',
      fill: '#ffffff'
    });
    this.levelText.setDepth(1001);
    
    // Pearl count
    this.pearlText = scene.add.text(x + 10, y + 27, 'Pearls: 0/0', {
      font: '14px monospace',
      fill: '#66d9ff'
    });
    this.pearlText.setDepth(1001);
    
    this.currentScore = 0;
    this.pearlCount = 0;
  }
  
  /**
   * Set scroll factor for all UI elements (keep fixed to camera)
   */
  setScrollFactor(factor) {
    this.background.setScrollFactor(factor);
    this.levelText.setScrollFactor(factor);
    this.pearlText.setScrollFactor(factor);
  }
  
  /**
   * Update level display
   */
  updateLevel(level) {
    this.levelText.setText(`Level: ${level}`);
    
    // Pulse effect on level change
    this.scene.tweens.add({
      targets: this.levelText,
      scale: 1.2,
      duration: 150,
      yoyo: true,
      ease: 'Back.easeOut'
    });
  }
  
  /**
   * Update pearl count
   */
  updatePearlCount(count, total) {
    this.pearlCount = count;
    
    if (total) {
      this.pearlText.setText(`Pearls: ${count}/${total}`);
    } else {
      this.pearlText.setText(`Pearls: ${count}`);
    }
  }
  
  /**
   * Cleanup
   */
  destroy() {
    this.background.destroy();
    this.levelText.destroy();
    this.pearlText.destroy();
  }
}
