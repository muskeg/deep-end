import Phaser from 'phaser';
import { COLORS } from '../utils/Constants.js';

/**
 * DepthMeter UI Component
 * Displays current depth and zone information
 */
export default class DepthMeter extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    
    this.scene = scene;
    scene.add.existing(this);
    
    // Create background
    this.bg = scene.add.rectangle(0, 0, 200, 70, 0x000000, 0.7);
    this.add(this.bg);
    
    // Depth text
    this.depthText = scene.add.text(0, -15, 'Depth: 0m', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.depthText.setOrigin(0.5);
    this.add(this.depthText);
    
    // Zone name text
    this.zoneText = scene.add.text(0, 10, 'Sunlight Zone', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aaffff'
    });
    this.zoneText.setOrigin(0.5);
    this.add(this.zoneText);
    
    this.setScrollFactor(0);
    this.setDepth(100);
  }

  /**
   * Update depth display
   * @param {number} depthInMeters - Current depth in meters
   */
  updateDepth(depthInMeters) {
    this.depthText.setText(`Depth: ${Math.floor(depthInMeters)}m`);
    
    // Color-code depth based on danger
    if (depthInMeters < 500) {
      this.depthText.setColor('#00ff00'); // Green - safe
    } else if (depthInMeters < 1500) {
      this.depthText.setColor('#ffaa00'); // Orange - caution
    } else {
      this.depthText.setColor('#ff0000'); // Red - danger
    }
  }

  /**
   * Update zone name display
   * @param {string} zoneName - Name of current zone
   */
  displayZoneName(zoneName) {
    this.zoneText.setText(zoneName);
    
    // Color-code zone name
    if (zoneName.includes('Sunlight')) {
      this.zoneText.setColor('#aaffff');
    } else if (zoneName.includes('Twilight')) {
      this.zoneText.setColor('#6666ff');
    } else if (zoneName.includes('Midnight')) {
      this.zoneText.setColor('#3333aa');
    }
  }

  /**
   * Show zone change notification
   * @param {string} zoneName - New zone name
   */
  showZoneChange(zoneName) {
    // Create temporary notification text
    const notification = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2 - 100,
      `Entering ${zoneName}`,
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#ffff00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6
      }
    );
    notification.setOrigin(0.5);
    notification.setScrollFactor(0);
    notification.setDepth(200);
    notification.setAlpha(0);
    
    // Fade in and out
    this.scene.tweens.add({
      targets: notification,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 1500,
      onComplete: () => {
        notification.destroy();
      }
    });
  }
}
