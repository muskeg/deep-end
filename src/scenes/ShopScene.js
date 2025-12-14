import Phaser from 'phaser';
import ProgressionSystem from '../systems/ProgressionSystem.js';
import UpgradeSystem from '../systems/UpgradeSystem.js';
import ShopMenu from '../ui/ShopMenu.js';
import { SCENES, COLORS } from '../utils/Constants.js';

/**
 * ShopScene
 * Surface shop for purchasing permanent upgrades
 */
export default class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.SHOP });
  }

  create() {
    console.log('[ShopScene] Initializing shop');
    
    // Initialize systems
    this.progressionSystem = new ProgressionSystem();
    this.upgradeSystem = new UpgradeSystem(this.progressionSystem);
    
    // Create background
    this.createBackground();
    
    // Create title
    this.createTitle();
    
    // Create shop menu
    this.shopMenu = new ShopMenu(this, this.progressionSystem);
    this.shopMenu.renderPearlBalance();
    this.shopMenu.renderUpgradeList((upgradeType) => this.onUpgradeClick(upgradeType));
    
    // Create start dive button
    this.createStartDiveButton();
    
    // Create statistics display
    this.createStatisticsDisplay();
  }

  /**
   * Create background visuals
   */
  createBackground() {
    // Dark blue background (surface water)
    this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x003d66
    );
    
    // Title background bar
    this.add.rectangle(
      this.scale.width / 2,
      40,
      this.scale.width,
      80,
      0x001a33,
      0.8
    );
  }

  /**
   * Create title text
   */
  createTitle() {
    this.add.text(
      this.scale.width / 2,
      40,
      'Surface Shop',
      {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6
      }
    ).setOrigin(0.5);
  }

  /**
   * Create start dive button
   */
  createStartDiveButton() {
    const buttonY = this.scale.height - 80;
    
    const button = this.add.rectangle(
      this.scale.width / 2,
      buttonY,
      300,
      60,
      0x00aa00,
      0.9
    );
    
    const buttonText = this.add.text(
      this.scale.width / 2,
      buttonY,
      'Start Dive',
      {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    button.setInteractive({ useHandCursor: true });
    
    button.on('pointerover', () => {
      button.setFillStyle(0x00cc00, 1.0);
    });
    
    button.on('pointerout', () => {
      button.setFillStyle(0x00aa00, 0.9);
    });
    
    button.on('pointerdown', () => {
      this.onStartDiveClick();
    });
  }

  /**
   * Create statistics display
   */
  createStatisticsDisplay() {
    const stats = this.progressionSystem.getStatistics();
    const x = 20;
    const y = this.scale.height - 150;
    
    const statsText = [
      `Total Pearls Collected: ${stats.totalPearlsCollected}`,
      `Enemies Killed: ${stats.enemiesKilled}`,
      `Deepest Depth: ${Math.floor(stats.deepestDepthReached)}m`,
      `Total Dives: ${stats.totalDives}`
    ].join('\n');
    
    this.add.text(x, y, statsText, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#cccccc',
      lineSpacing: 5
    });
  }

  /**
   * Handle upgrade purchase click
   * @param {string} upgradeType - Type of upgrade to purchase
   */
  onUpgradeClick(upgradeType) {
    const success = this.progressionSystem.purchaseUpgrade(upgradeType);
    
    if (success) {
      console.log(`[ShopScene] Purchased ${upgradeType} upgrade`);
      
      // Play purchase sound
      // TODO: this.sound.play('purchase');
      
      // Refresh menu to show updated costs and balance
      this.shopMenu.refresh((type) => this.onUpgradeClick(type));
      
      // Show success feedback
      this.showPurchaseSuccess(upgradeType);
    } else {
      console.warn(`[ShopScene] Failed to purchase ${upgradeType}`);
      
      // Show error feedback
      this.showPurchaseError();
    }
  }

  /**
   * Handle start dive button click
   */
  onStartDiveClick() {
    console.log('[ShopScene] Starting new dive');
    
    // Increment dive counter
    this.progressionSystem.updateStatistic('totalDives', 1);
    
    // Get all owned upgrades
    const upgrades = this.progressionSystem.getAllUpgrades();
    
    // Calculate upgrade effects
    const upgradeParams = {
      oxygenMultiplier: this.upgradeSystem.getUpgradeMultiplier('oxygen', 'maxOxygenMultiplier'),
      lightMultiplier: this.upgradeSystem.getUpgradeMultiplier('light', 'lightRadiusMultiplier'),
      speedMultiplier: this.upgradeSystem.getUpgradeMultiplier('speed', 'speedMultiplier'),
      harpoonDamageBonus: this.upgradeSystem.getUpgradeBonus('harpoon', 'harpoonDamageBonus'),
      dashCooldownReduction: this.upgradeSystem.getUpgradeReduction('dash', 'dashCooldownReduction') * 1000,
      sonarRangeBonus: this.upgradeSystem.getUpgradeBonus('sonar', 'sonarRangeBonus')
    };
    
    console.log('[ShopScene] Upgrade parameters:', upgradeParams);
    
    // Transition to game scene with upgrade data
    this.scene.start(SCENES.GAME, { upgradeParams });
  }

  /**
   * Show purchase success feedback
   * @param {string} upgradeType - Purchased upgrade type
   */
  showPurchaseSuccess(upgradeType) {
    const text = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      `${upgradeType.toUpperCase()} UPGRADED!`,
      {
        fontSize: '36px',
        fontFamily: 'Arial',
        color: '#00ff00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6
      }
    ).setOrigin(0.5).setAlpha(0);
    
    // Fade in and out
    this.tweens.add({
      targets: text,
      alpha: 1,
      duration: 200,
      yoyo: true,
      hold: 500,
      onComplete: () => {
        text.destroy();
      }
    });
  }

  /**
   * Show purchase error feedback
   */
  showPurchaseError() {
    const text = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      'INSUFFICIENT PEARLS',
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#ff0000',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6
      }
    ).setOrigin(0.5).setAlpha(0);
    
    // Fade in and out
    this.tweens.add({
      targets: text,
      alpha: 1,
      duration: 200,
      yoyo: true,
      hold: 500,
      onComplete: () => {
        text.destroy();
      }
    });
  }
}
