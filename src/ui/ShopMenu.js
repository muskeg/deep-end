import Phaser from 'phaser';
import { COLORS } from '../utils/Constants.js';

/**
 * ShopMenu UI Component
 * Renders upgrade list and purchase interface
 */
export default class ShopMenu {
  constructor(scene, progressionSystem) {
    this.scene = scene;
    this.progressionSystem = progressionSystem;
    
    this.container = scene.add.container(0, 0);
    this.upgradeButtons = [];
  }

  /**
   * Render pearl balance display
   * @returns {Phaser.GameObjects.Text} Pearl balance text
   */
  renderPearlBalance() {
    const pearls = this.progressionSystem.getPearls();
    
    const balanceText = this.scene.add.text(
      this.scene.scale.width / 2,
      80,
      `Pearls: ${pearls}`,
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    this.container.add(balanceText);
    return balanceText;
  }

  /**
   * Render list of all upgrades
   * @param {Function} onPurchaseCallback - Called when upgrade purchased
   */
  renderUpgradeList(onPurchaseCallback) {
    const upgrades = this.progressionSystem.getAllUpgrades();
    const startY = 150;
    const spacing = 100;
    
    upgrades.forEach((upgrade, index) => {
      const y = startY + (index * spacing);
      const button = this.createPurchaseButton(upgrade, y, onPurchaseCallback);
      this.upgradeButtons.push(button);
    });
  }

  /**
   * Create purchase button for an upgrade
   * @param {Object} upgrade - Upgrade data
   * @param {number} y - Y position
   * @param {Function} callback - Purchase callback
   * @returns {Object} Button elements
   */
  createPurchaseButton(upgrade, y, callback) {
    const x = this.scene.scale.width / 2;
    const canAfford = upgrade.canAfford;
    const isMaxed = upgrade.currentLevel >= 10; // Max level cap
    
    // Background
    const bg = this.scene.add.rectangle(
      x, y, 700, 80,
      canAfford && !isMaxed ? 0x2a4a2a : 0x4a2a2a,
      0.8
    );
    
    // Upgrade name and level
    const nameText = this.scene.add.text(
      x - 320, y - 20,
      `${upgrade.name} (Lv ${upgrade.currentLevel})`,
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    
    // Description
    const descText = this.scene.add.text(
      x - 320, y + 5,
      upgrade.description,
      {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#cccccc'
      }
    );
    
    // Cost or status
    let costText;
    if (isMaxed) {
      costText = this.scene.add.text(
        x + 250, y,
        'MAX',
        {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#ffaa00',
          fontStyle: 'bold'
        }
      ).setOrigin(1, 0.5);
    } else {
      costText = this.scene.add.text(
        x + 250, y,
        `${upgrade.nextCost} 💎`,
        {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: canAfford ? '#00ff00' : '#ff6666',
          fontStyle: 'bold'
        }
      ).setOrigin(1, 0.5);
    }
    
    // Make interactive if can afford and not maxed
    if (canAfford && !isMaxed) {
      bg.setInteractive({ useHandCursor: true });
      
      bg.on('pointerover', () => {
        bg.setFillStyle(0x3a6a3a, 1.0);
      });
      
      bg.on('pointerout', () => {
        bg.setFillStyle(0x2a4a2a, 0.8);
      });
      
      bg.on('pointerdown', () => {
        callback(upgrade.type);
      });
    }
    
    this.container.add([bg, nameText, descText, costText]);
    
    return { bg, nameText, descText, costText, upgrade };
  }

  /**
   * Refresh UI to show updated values
   * @param {Function} onPurchaseCallback - Purchase callback
   */
  refresh(onPurchaseCallback) {
    // Clear existing UI
    this.container.removeAll(true);
    this.upgradeButtons = [];
    
    // Re-render
    this.renderPearlBalance();
    this.renderUpgradeList(onPurchaseCallback);
  }

  /**
   * Destroy menu
   */
  destroy() {
    this.container.destroy();
  }
}
