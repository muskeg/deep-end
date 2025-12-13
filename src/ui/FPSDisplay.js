/**
 * FPS Display Component
 * Shows real-time FPS counter and frame time
 * Toggle with 'F' key
 */
export default class FPSDisplay {
  constructor(scene) {
    this.scene = scene;
    this.visible = false;
    this.lastFpsUpdate = 0;
    this.updateInterval = 100; // Update every 100ms
    
    const width = scene.cameras.main.width;
    
    // FPS text
    this.fpsText = scene.add.text(width - 10, 10, 'FPS: 60', {
      font: 'bold 16px monospace',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.fpsText.setOrigin(1, 0);
    this.fpsText.setScrollFactor(0);
    this.fpsText.setDepth(3000);
    this.fpsText.setVisible(false);
    
    // Frame time text
    this.frameTimeText = scene.add.text(width - 10, 35, 'Frame: 16.7ms', {
      font: '14px monospace',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.frameTimeText.setOrigin(1, 0);
    this.frameTimeText.setScrollFactor(0);
    this.frameTimeText.setDepth(3000);
    this.frameTimeText.setVisible(false);
    
    // Set up F key toggle
    scene.input.keyboard.on('keydown-F', () => {
      this.toggle();
    });
  }
  
  /**
   * Toggle FPS display visibility
   */
  toggle() {
    this.visible = !this.visible;
    this.fpsText.setVisible(this.visible);
    this.frameTimeText.setVisible(this.visible);
  }
  
  /**
   * Update FPS display
   * @param {number} time - Current game time
   * @param {number} delta - Time since last frame
   */
  update(time, delta) {
    if (!this.visible) return;
    
    // Only update display every updateInterval ms to avoid flicker
    if (time - this.lastFpsUpdate < this.updateInterval) return;
    
    this.lastFpsUpdate = time;
    
    // Calculate FPS from delta
    const fps = Math.round(1000 / delta);
    const frameTime = delta.toFixed(1);
    
    // Color code based on performance
    let fpsColor = '#00ff00'; // Green for good (>=55 FPS)
    if (fps < 55) fpsColor = '#ffff00'; // Yellow for warning (30-54 FPS)
    if (fps < 30) fpsColor = '#ff0000'; // Red for poor (<30 FPS)
    
    this.fpsText.setText(`FPS: ${fps}`);
    this.fpsText.setFill(fpsColor);
    this.frameTimeText.setText(`Frame: ${frameTime}ms`);
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    this.fpsText.destroy();
    this.frameTimeText.destroy();
  }
}
