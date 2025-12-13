import { COLORS, OXYGEN_CONFIG } from '../utils/Constants.js';

/**
 * OxygenMeter UI Component
 * Displays oxygen level with color-coded warning states
 */
export default class OxygenMeter {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    
    // Background
    this.background = scene.add.graphics();
    this.background.fillStyle(0x000000, 0.7);
    this.background.fillRoundedRect(x, y, 200, 30, 5);
    this.background.setDepth(1000);
    
    // Oxygen bar
    this.bar = scene.add.graphics();
    this.bar.setDepth(1001);
    
    // Text label
    this.text = scene.add.text(x + 10, y + 7, 'O2: 100%', {
      font: 'bold 16px monospace',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.text.setDepth(1002);
    
    this.currentOxygen = 100;
  }
  
  /**
   * Set scroll factor for all UI elements (keep fixed to camera)
   */
  setScrollFactor(factor) {
    this.background.setScrollFactor(factor);
    this.bar.setScrollFactor(factor);
    this.text.setScrollFactor(factor);
  }
  
  /**
   * Update oxygen display
   */
  update(oxygenPercent) {
    this.currentOxygen = Math.max(0, Math.min(100, oxygenPercent));
    
    // Clear and redraw bar
    this.bar.clear();
    
    // Determine color based on oxygen level
    let color = COLORS.OXYGEN_FULL;
    if (this.currentOxygen <= OXYGEN_CONFIG.WARNING_THRESHOLD) {
      color = COLORS.OXYGEN_CRITICAL;
    } else if (this.currentOxygen <= OXYGEN_CONFIG.WARNING_THRESHOLD * 2) {
      color = COLORS.OXYGEN_WARNING;
    }
    
    // Draw bar
    const barWidth = (this.currentOxygen / 100) * 180;
    this.bar.fillStyle(color, 1);
    this.bar.fillRoundedRect(this.x + 10, this.y + 5, barWidth, 20, 3);
    
    // Update text
    this.text.setText(`O2: ${Math.round(this.currentOxygen)}%`);
  }
  
  /**
   * Show warning pulse effect
   */
  showWarning() {
    this.scene.tweens.add({
      targets: [this.bar, this.text],
      alpha: 0.3,
      duration: 300,
      yoyo: true,
      repeat: 2
    });
  }
  
  /**
   * Cleanup
   */
  destroy() {
    this.background.destroy();
    this.bar.destroy();
    this.text.destroy();
  }
}
